import { Injectable } from '@nestjs/common'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as crypto from 'crypto'

const execAsync = promisify(exec)

@Injectable()
export class CodeExecutionService {
  private readonly allowlistPackages = {
    python: [
      'requests',
      'pandas',
      'numpy',
      'beautifulsoup4',
      'flask',
      'sqlalchemy',
      'pytesseract',
      'openai',
    ],
    javascript: [
      'axios',
      'lodash',
      'moment',
      'csv-parser',
      'pdf2pic',
    ],
  }

  private readonly timeout = 60000 // 60 seconds

  async executeCode(
    language: 'python' | 'javascript',
    code: string,
    packages: string[] = [],
    input?: any,
  ): Promise<{
    output: string
    logs: string[]
    artifacts: string[]
    error?: string
  }> {
    const executionId = crypto.randomUUID()
    const workspacePath = `/tmp/autoflow-${executionId}`

    try {
      // Create workspace
      await fs.mkdir(workspacePath, { recursive: true })

      // Validate packages
      const allowedPackages = packages.filter((pkg) =>
        this.allowlistPackages[language].includes(pkg),
      )

      // Create execution script
      const scriptPath = await this.createExecutionScript(
        workspacePath,
        language,
        code,
        allowedPackages,
        input,
      )

      // Execute code
      const { stdout, stderr } = await this.runInSandbox(
        scriptPath,
        workspacePath,
        language,
      )

      // Collect artifacts
      const artifacts = await this.collectArtifacts(workspacePath)

      return {
        output: stdout || stderr,
        logs: [stdout, stderr].filter(Boolean),
        artifacts,
      }
    } catch (error) {
      return {
        output: '',
        logs: [],
        error: error.message,
        artifacts: [],
      }
    } finally {
      // Cleanup workspace
      try {
        await fs.rm(workspacePath, { recursive: true, force: true })
      } catch (error) {
        console.error('Cleanup failed:', error)
      }
    }
  }

  private async createExecutionScript(
    workspacePath: string,
    language: 'python' | 'javascript',
    code: string,
    packages: string[],
    input?: any,
  ): Promise<string> {
    let scriptContent = ''

    if (language === 'python') {
      scriptContent = `
import sys
import json

# Write input to file
with open('input.json', 'w') as f:
    json.dump(${JSON.stringify(input)}, f)

# Install packages
${packages.map((pkg) => `import subprocess; subprocess.check_call([sys.executable, '-m', 'pip', 'install', '${pkg}'])`).join('\n')}

# Execute user code
${code}

print("Execution completed successfully")
      `
    } else {
      scriptContent = `
const fs = require('fs');

// Write input to file
fs.writeFileSync('input.json', JSON.stringify(${JSON.stringify(input)}, null, 2));

// Install packages
${packages.map((pkg) => `const { execSync } = require('child_process'); execSync('npm install ${pkg}', { stdio: 'inherit' });`).join('\n')}

// Execute user code
${code}

console.log("Execution completed successfully");
      `
    }

    const scriptPath = path.join(workspacePath, `main.${language === 'python' ? 'py' : 'js'}`)
    await fs.writeFile(scriptPath, scriptContent)
    return scriptPath
  }

  private async runInSandbox(
    scriptPath: string,
    workspacePath: string,
    language: 'python' | 'javascript',
  ): Promise<{ stdout: string; stderr: string }> {
    const command =
      language === 'python'
        ? `python3 ${scriptPath}`
        : `node ${scriptPath}`

    return new Promise((resolve, reject) => {
      const child = exec(command, {
        cwd: workspacePath,
        timeout: this.timeout,
        maxBuffer: 1024 * 1024, // 1MB
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr })
        } else {
          reject(new Error(`Process exited with code ${code}\n${stderr}`))
        }
      })

      child.on('error', (error) => {
        reject(error)
      })
    })
  }

  private async collectArtifacts(workspacePath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(workspacePath)
      return files
        .filter((file) => !file.startsWith('.'))
        .map((file) => `workspace://${file}`)
    } catch (error) {
      return []
    }
  }

  async getArtifactContent(executionId: string, artifactPath: string): Promise<Buffer> {
    const fullPath = path.join('/tmp', `autoflow-${executionId}`, artifactPath)
    return fs.readFile(fullPath)
  }
}
