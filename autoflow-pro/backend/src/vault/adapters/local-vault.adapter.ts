import { Injectable, Logger } from '@nestjs/common'
import { promises as fs } from 'fs'
import * as path from 'path'
import { VaultAdapter } from './vault-adapter.interface'

@Injectable()
export class LocalVaultAdapter implements VaultAdapter {
  private readonly logger = new Logger(LocalVaultAdapter.name)
  private readonly secretsPath: string

  constructor() {
    this.secretsPath = process.env.VAULT_LOCAL_PATH || './secrets'
    this.ensureSecretsDirectory()
  }

  private async ensureSecretsDirectory() {
    try {
      await fs.mkdir(this.secretsPath, { recursive: true })
    } catch (error) {
      this.logger.error(`Failed to create secrets directory: ${error.message}`)
    }
  }

  private getSecretFilePath(key: string): string {
    const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_')
    return path.join(this.secretsPath, `${sanitizedKey}.json`)
  }

  async getSecret(key: string): Promise<string | null> {
    try {
      const filePath = this.getSecretFilePath(key)
      const data = await fs.readFile(filePath, 'utf8')
      const secret = JSON.parse(data)
      return secret.value || null
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null
      }
      this.logger.error(`Failed to get secret ${key}: ${error.message}`)
      return null
    }
  }

  async setSecret(key: string, value: string): Promise<void> {
    try {
      const filePath = this.getSecretFilePath(key)
      const secret = {
        key,
        value,
        updatedAt: new Date().toISOString(),
      }
      await fs.writeFile(filePath, JSON.stringify(secret, null, 2), 'utf8')
    } catch (error) {
      this.logger.error(`Failed to set secret ${key}: ${error.message}`)
      throw error
    }
  }

  async deleteSecret(key: string): Promise<void> {
    try {
      const filePath = this.getSecretFilePath(key)
      await fs.unlink(filePath)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return
      }
      this.logger.error(`Failed to delete secret ${key}: ${error.message}`)
      throw error
    }
  }

  async listSecrets(prefix?: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.secretsPath)
      const secrets: string[] = []

      for (const file of files) {
        if (file.endsWith('.json')) {
          const key = file.replace('.json', '')
          if (!prefix || key.startsWith(prefix)) {
            secrets.push(key)
          }
        }
      }

      return secrets
    } catch (error) {
      this.logger.error(`Failed to list secrets: ${error.message}`)
      return []
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await fs.access(this.secretsPath)
      return true
    } catch (error) {
      return false
    }
  }
}
