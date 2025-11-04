import * as path from 'path'
import * as fs from 'fs'
import { ReleaseCheckReport } from '../checklist'

export class MarkdownReporter {
  static async generateReport(
    report: ReleaseCheckReport,
    outputDir: string
  ): Promise<string> {
    const timestamp = report.timestamp.toISOString().replace(/[:.]/g, '-')
    const filename = `release-check-${report.version}-${timestamp}.md`
    const filepath = path.join(outputDir, filename)

    const markdown = this.buildMarkdown(report)

    await fs.promises.mkdir(outputDir, { recursive: true })
    await fs.promises.writeFile(filepath, markdown)

    return filepath
  }

  private static buildMarkdown(report: ReleaseCheckReport): string {
    const blocks: string[] = []

    blocks.push('# 🚀 Release Checklist Report')
    blocks.push('')
    blocks.push(`**Version:** ${report.version}`)
    blocks.push(`**Generated:** ${report.timestamp.toISOString()}`)
    blocks.push(`**Score:** ${report.score}/100 (Grade: ${report.grade})`)
    blocks.push('')

    blocks.push('## 📊 Summary')
    blocks.push('')
    blocks.push('| Metric | Value |')
    blocks.push('|--------|-------|')
    blocks.push(`| Total Checks | ${report.summary.total} |`)
    blocks.push(`| ✅ Passed | ${report.summary.passed} |`)
    blocks.push(`| ❌ Failed | ${report.summary.failed} |`)
    blocks.push(`| ⚠️ Warnings | ${report.summary.warnings} |`)
    blocks.push(`| ⏭️ Skipped | ${report.summary.skipped} |`)
    blocks.push(`| ⏳ Pending | ${report.summary.pending} |`)
    blocks.push(`| 🤖 Automated | ${report.summary.automated} |`)
    blocks.push(`| 👤 Manual | ${report.summary.manual} |`)
    blocks.push('')

    blocks.push('## 📈 Category Breakdown')
    blocks.push('')
    blocks.push('| Category | Coverage | Passed/Total |')
    blocks.push('|----------|----------|--------------|')

    Object.entries(report.categories).forEach(([category, stats]) => {
      const categoryName = this.formatCategoryName(category)
      blocks.push(`| ${categoryName} | ${stats.coverage}% | ${stats.passed}/${stats.total} |`)
    })

    blocks.push('')
    blocks.push('## 📋 Detailed Results')
    blocks.push('')

    const groupedResults = this.groupResultsByCategory(report.results)

    Object.entries(groupedResults).forEach(([category, results]) => {
      const categoryName = this.formatCategoryName(category)
      blocks.push(`### ${categoryName}`)
      blocks.push('')
      blocks.push('| ID | Title | Status | Severity | Required | Duration |')
      blocks.push('|----|-------|--------|----------|----------|----------|')

      results.forEach(result => {
        const status = this.formatStatus(result.status)
        const severity = result.item.severity.toUpperCase()
        const required = result.item.required ? '✅' : '❌'
        const duration = result.duration ? `${result.duration}ms` : '-'
        const title = result.item.title

        blocks.push(
          `| ${result.item.id} | ${title} | ${status} | ${severity} | ${required} | ${duration} |`
        )
      })

      blocks.push('')
    })

    blocks.push('## 💡 Recommendations')
    blocks.push('')

    if (report.recommendations.length > 0) {
      report.recommendations.forEach(rec => {
        blocks.push(`- ${rec}`)
      })
    } else {
      blocks.push('No specific recommendations. All checks passed!')
    }

    blocks.push('')
    blocks.push('## 🔍 Failed Checks Detail')
    blocks.push('')

    const failedResults = report.results.filter(r => r.status === 'failed')

    if (failedResults.length > 0) {
      failedResults.forEach(result => {
        blocks.push(`### ${result.item.id}: ${result.item.title}`)
        blocks.push('')
        blocks.push(`**Category:** ${result.item.category}`)
        blocks.push(`**Severity:** ${result.item.severity}`)
        blocks.push(`**Error:** ${result.error || 'Unknown error'}`)
        
        if (result.output) {
          blocks.push('')
          blocks.push('**Output:**')
          blocks.push('```')
          blocks.push(result.output.substring(0, 2000))
          blocks.push('```')
        }
        
        blocks.push('')
      })
    } else {
      blocks.push('No failed checks! 🎉')
      blocks.push('')
    }

    blocks.push('## ⚡ Quick Actions')
    blocks.push('')

    const criticalFailed = report.results.filter(
      r => r.status === 'failed' && r.item.severity === 'critical'
    )

    const highFailed = report.results.filter(
      r => r.status === 'failed' && r.item.severity === 'high'
    )

    if (criticalFailed.length > 0 || highFailed.length > 0) {
      blocks.push('### 🚨 Immediate Actions Required')
      blocks.push('')
      
      criticalFailed.forEach(result => {
        blocks.push(`- [ ] **CRITICAL:** ${result.item.title} (${result.item.id})`)
        blocks.push(`  - ${result.error}`)
      })

      highFailed.forEach(result => {
        blocks.push(`- [ ] **HIGH:** ${result.item.title} (${result.item.id})`)
        blocks.push(`  - ${result.error}`)
      })
    } else {
      blocks.push('No immediate actions required. System is ready for release!')
    }

    blocks.push('')
    blocks.push('## 📝 Next Steps')
    blocks.push('')
    blocks.push('1. Review all failed checks')
    blocks.push('2. Address critical and high severity issues')
    blocks.push('3. Complete manual checks marked as pending')
    blocks.push('4. Re-run release checklist')
    blocks.push('5. Proceed with deployment if all critical checks pass')

    blocks.push('')
    blocks.push('---')
    blocks.push('')
    blocks.push(`*Report generated by AutoFlow Pro Release Checklist v1.0*`)

    return blocks.join('\n')
  }

  private static groupResultsByCategory(results: any[]): Record<string, any[]> {
    return results.reduce((acc, result) => {
      const category = result.item.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(result)
      return acc
    }, {} as Record<string, any[]>)
  }

  private static formatCategoryName(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private static formatStatus(status: string): string {
    const icons = {
      passed: '✅ Passed',
      failed: '❌ Failed',
      warning: '⚠️ Warning',
      skipped: '⏭️ Skipped',
      pending: '⏳ Pending',
    }
    return icons[status as keyof typeof icons] || status
  }
}
