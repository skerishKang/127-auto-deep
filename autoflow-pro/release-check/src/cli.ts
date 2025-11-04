#!/usr/bin/env node

import { Command } from 'commander'
import * as path from 'path'
import { ReleaseCheckerService } from './validators/checker.service'
import { MarkdownReporter } from './reporters/markdown.reporter'
import { RELEASE_CHECKLIST, ChecklistCategory } from './checklist'

const program = new Command()

program
  .name('release-check')
  .description('AutoFlow Pro Release Checklist Validator')
  .version('1.0.0')

program
  .command('run')
  .description('Run full release checklist')
  .option('-v, --version <version>', 'Release version')
  .option('-s, --skip-manual', 'Skip manual checks')
  .option('-o, --output <dir>', 'Output directory for reports', './release-reports')
  .option('-c, --category <category...>', 'Filter by category')
  .action(async (options) => {
    try {
      console.log('\n🚀 AutoFlow Pro Release Checklist')
      console.log('==================================\n')

      let checklist = RELEASE_CHECKLIST

      if (options.category) {
        const categories = options.category as string[]
        checklist = RELEASE_CHECKLIST.filter(item =>
          categories.includes(item.category)
        )
        console.log(`📂 Filtered by categories: ${categories.join(', ')}\n`)
      }

      const checker = new ReleaseCheckerService()
      const report = await checker.runChecklist(checklist, {
        version: options.version,
        skipManual: options.skipManual,
        outputDir: options.output,
      })

      const mdPath = await MarkdownReporter.generateReport(report, options.output)
      console.log(`\n📄 Markdown report: ${mdPath}`)

      if (report.grade === 'F' || report.grade === 'D') {
        console.log('\n❌ Release check failed. Please fix critical issues before releasing.')
        process.exit(1)
      } else if (report.grade === 'C') {
        console.log('\n⚠️  Release check passed with warnings. Review recommendations.')
      } else {
        console.log('\n✅ Release check passed! Ready for deployment.')
      }
    } catch (error: any) {
      console.error('\n❌ Error:', error.message)
      process.exit(1)
    }
  })

program
  .command('list')
  .description('List all checklist items')
  .option('-c, --category <category>', 'Filter by category')
  .action((options) => {
    let checklist = RELEASE_CHECKLIST

    if (options.category) {
      checklist = RELEASE_CHECKLIST.filter(
        item => item.category === options.category
      )
    }

    console.log('\n📋 Release Checklist Items\n')

    const grouped = checklist.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, typeof checklist>)

    Object.entries(grouped).forEach(([category, items]) => {
      console.log(`\n## ${category.toUpperCase()}`)
      console.log('')

      items.forEach(item => {
        const status = item.automated ? '🤖' : '👤'
        const required = item.required ? '⭐' : '  '
        const severity = item.severity.toUpperCase().padEnd(8)
        
        console.log(
          `  ${required} ${status} [${item.id}] ${item.title}`
        )
        console.log(`      Severity: ${severity} | ${item.description}`)
      })
    })
  })

program
  .command('check <id>')
  .description('Run a specific checklist item')
  .option('-o, --output <file>', 'Save output to file')
  .action(async (id, options) => {
    const item = RELEASE_CHECKLIST.find(i => i.id === id)

    if (!item) {
      console.error(`❌ Checklist item not found: ${id}`)
      process.exit(1)
    }

    console.log(`\n📋 Running check: ${item.title}\n`)

    const checker = new ReleaseCheckerService()

    try {
      const report = await checker.runChecklist([item])
      const result = report.results[0]

      if (result.status === 'passed') {
        console.log('\n✅ Check passed!')
        process.exit(0)
      } else {
        console.log(`\n❌ Check ${result.status}`)
        if (result.error) {
          console.error('Error:', result.error)
        }
        process.exit(1)
      }
    } catch (error: any) {
      console.error('\n❌ Error:', error.message)
      process.exit(1)
    }
  })

program.parse()
