import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import {
  ChecklistItem,
  ChecklistResult,
  ChecklistCategory,
  ReleaseCheckReport,
} from '../checklist'

const execAsync = promisify(exec)

export class ReleaseCheckerService {
  private results: ChecklistResult[] = []

  async runChecklist(
    items: ChecklistItem[],
    options: {
      version?: string
      skipManual?: boolean
      outputDir?: string
    } = {}
  ): Promise<ReleaseCheckReport> {
    console.log('\n🚀 Starting Release Checklist...\n')

    this.results = []

    for (const item of items) {
      if (options.skipManual && item.manualCheck) {
        console.log(`⏭️  Skipping manual check: ${item.title}`)
        this.results.push({
          item,
          status: 'skipped',
          timestamp: new Date(),
        })
        continue
      }

      await this.runCheck(item)
    }

    const report = this.generateReport(items, options.version)
    this.printSummary(report)

    if (options.outputDir) {
      const reportPath = await this.saveReport(report, options.outputDir)
      console.log(`\n📄 Report saved to: ${reportPath}`)
    }

    return report
  }

  private async runCheck(item: ChecklistItem): Promise<void> {
    const startTime = Date.now()
    console.log(`\n📋 [${item.id}] ${item.title}`)
    console.log(`   Category: ${item.category}`)
    console.log(`   Severity: ${item.severity}`)
    console.log(`   Required: ${item.required ? 'Yes' : 'No'}`)

    if (!item.automated && !item.command) {
      console.log('   ⚠️  Manual check required')
      this.results.push({
        item,
        status: 'pending',
        timestamp: new Date(),
      })
      return
    }

    try {
      if (item.command) {
        const { stdout, stderr } = await execAsync(item.command, {
          timeout: 300000, // 5 minutes timeout
        })

        const output = stdout || stderr
        const duration = Date.now() - startTime

        let status: ChecklistResult['status'] = 'passed'
        let error: string | undefined

        if (item.validator) {
          const isValid = item.validator(output)
          status = isValid ? 'passed' : 'failed'
          
          if (!isValid) {
            error = 'Validation failed'
            console.log(`   ❌ Failed`)
            console.log(`   Output: ${output.substring(0, 500)}...`)
          }
        }

        console.log(`   ✅ Passed (${duration}ms)`)
        
        this.results.push({
          item,
          status,
          output,
          duration,
          timestamp: new Date(),
        })
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      console.log(`   ❌ Failed`)
      console.log(`   Error: ${error.message}`)

      this.results.push({
        item,
        status: 'failed',
        error: error.message,
        duration,
        timestamp: new Date(),
      })
    }
  }

  private generateReport(
    items: ChecklistItem[],
    version?: string
  ): ReleaseCheckReport {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      pending: this.results.filter(r => r.status === 'pending').length,
      automated: this.results.filter(r => r.item.automated).length,
      manual: this.results.filter(r => !r.item.automated).length,
    }

    const categories = {} as Record<ChecklistCategory, any>
    Object.values(ChecklistCategory).forEach(category => {
      const categoryResults = this.results.filter(r => r.item.category === category)
      categories[category] = {
        total: categoryResults.length,
        passed: categoryResults.filter(r => r.status === 'passed').length,
        failed: categoryResults.filter(r => r.status === 'failed').length,
        coverage: categoryResults.length > 0
          ? Math.round((categoryResults.filter(r => r.status === 'passed').length / categoryResults.length) * 100)
          : 0,
      }
    })

    const recommendations = this.generateRecommendations()

    const score = this.calculateScore(this.results)

    const grade = score >= 90 ? 'A' :
                  score >= 80 ? 'B' :
                  score >= 70 ? 'C' :
                  score >= 60 ? 'D' : 'F'

    return {
      version: version || '1.0.0',
      timestamp: new Date(),
      results: this.results,
      summary,
      categories,
      recommendations,
      score,
      grade,
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    const failedItems = this.results.filter(r => r.status === 'failed')
    const pendingItems = this.results.filter(r => r.status === 'pending')

    if (failedItems.length > 0) {
      recommendations.push(`❗ Fix ${failedItems.length} failing checks before release`)
      
      failedItems.forEach(item => {
        if (item.item.severity === 'critical') {
          recommendations.push(`   • CRITICAL: ${item.item.title} - ${item.error}`)
        }
      })
    }

    if (pendingItems.length > 0) {
      recommendations.push(`⚠️  Complete ${pendingItems.length} manual checks`)
    }

    const securityIssues = this.results.filter(
      r => r.item.category === ChecklistCategory.SECURITY && r.status !== 'passed'
    )

    if (securityIssues.length > 0) {
      recommendations.push('🔒 Address all security issues before production deployment')
    }

    const performanceIssues = this.results.filter(
      r => r.item.category === ChecklistCategory.PERFORMANCE && r.status !== 'passed'
    )

    if (performanceIssues.length > 0) {
      recommendations.push('⚡ Review performance optimization opportunities')
    }

    const testingCoverage = this.results.find(
      r => r.item.id === 'TS002' && r.status === 'passed'
    )

    if (!testingCoverage) {
      recommendations.push('🧪 Improve test coverage to at least 80%')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All checks passed! Ready for release.')
    }

    return recommendations
  }

  private calculateScore(results: ChecklistResult[]): number {
    const weights = {
      critical: 3,
      high: 2,
      medium: 1,
      low: 0.5,
    }

    let totalScore = 0
    let maxScore = 0

    results.forEach(result => {
      const weight = weights[result.item.severity]
      maxScore += weight * 10

      if (result.status === 'passed') {
        totalScore += weight * 10
      } else if (result.status === 'warning') {
        totalScore += weight * 5
      } else if (result.status === 'skipped' && result.item.required) {
        totalScore += weight * 10 * 0.5 // Partial credit for skipped required items
      }
    })

    return Math.round((totalScore / maxScore) * 100)
  }

  private printSummary(report: ReleaseCheckReport): void {
    console.log('\n' + '='.repeat(80))
    console.log('📊 RELEASE CHECK SUMMARY')
    console.log('='.repeat(80))

    console.log(`\n📦 Version: ${report.version}`)
    console.log(`⏱️  Timestamp: ${report.timestamp.toISOString()}`)
    console.log(`🎯 Score: ${report.score}/100 (Grade: ${report.grade})`)

    console.log('\n📈 Overall Statistics:')
    console.log(`   Total Checks: ${report.summary.total}`)
    console.log(`   ✅ Passed: ${report.summary.passed}`)
    console.log(`   ❌ Failed: ${report.summary.failed}`)
    console.log(`   ⚠️  Warnings: ${report.summary.warnings}`)
    console.log(`   ⏭️  Skipped: ${report.summary.skipped}`)
    console.log(`   ⏳ Pending: ${report.summary.pending}`)
    console.log(`   🤖 Automated: ${report.summary.automated}`)
    console.log(`   👤 Manual: ${report.summary.manual}`)

    console.log('\n📊 Category Breakdown:')
    Object.entries(report.categories).forEach(([category, stats]) => {
      console.log(`   ${category}:`)
      console.log(`      Coverage: ${stats.coverage}%`)
      console.log(`      Passed: ${stats.passed}/${stats.total}`)
    })

    console.log('\n💡 Recommendations:')
    report.recommendations.forEach(rec => {
      console.log(`   ${rec}`)
    })

    console.log('\n' + '='.repeat(80))
  }

  private async saveReport(
    report: ReleaseCheckReport,
    outputDir: string
  ): Promise<string> {
    const timestamp = report.timestamp.toISOString().replace(/[:.]/g, '-')
    const filename = `release-check-${report.version}-${timestamp}.json`
    const filepath = path.join(outputDir, filename)

    await fs.promises.mkdir(outputDir, { recursive: true })
    await fs.promises.writeFile(filepath, JSON.stringify(report, null, 2))

    return filepath
  }
}
