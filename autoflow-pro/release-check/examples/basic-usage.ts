import { ReleaseCheckerService } from '../src/validators/checker.service'
import { MarkdownReporter } from '../src/reporters/markdown.reporter'
import { RELEASE_CHECKLIST } from '../src/checklist'

async function main() {
  console.log('🚀 Running AutoFlow Pro Release Checklist...\n')

  const checker = new ReleaseCheckerService()
  const report = await checker.runChecklist(RELEASE_CHECKLIST, {
    version: '1.0.0',
    skipManual: false,
    outputDir: './examples/output',
  })

  console.log('\n📄 Generating Markdown report...')
  const mdPath = await MarkdownReporter.generateReport(report, './examples/output')
  console.log(`Report saved to: ${mdPath}`)

  console.log(`\n🎯 Final Score: ${report.score}/100 (${report.grade})`)

  if (report.score >= 80) {
    console.log('✅ Ready for release!')
  } else {
    console.log('❌ Please fix issues before releasing.')
  }
}

main().catch(console.error)
