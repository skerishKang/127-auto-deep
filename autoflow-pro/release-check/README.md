# AutoFlow Pro Release Checklist

🚀 Automated release checklist validation tool for AutoFlow Pro

## Features

- ✅ Automated quality checks (ESLint, TypeScript, Tests)
- 🔒 Security scanning (vulnerability detection)
- 📊 Comprehensive reporting (JSON & Markdown)
- 🎯 Grading system (A-F score)
- 🔄 CI/CD integration ready
- 📋 30+ predefined checklist items

## Installation

```bash
npm install -g autoflow-release-check
```

Or use without installation:

```bash
npx release-check <command>
```

## Usage

### Run Full Checklist

```bash
release-check run --version 1.0.0 --output ./reports
```

### List All Checklist Items

```bash
release-check list
```

### Filter by Category

```bash
release-check run --category code_quality testing security
```

### Run Specific Check

```bash
release-check check CQ001
```

### Skip Manual Checks

```bash
release-check run --skip-manual
```

## Checklist Categories

### 📝 Code Quality
- ESLint compliance
- TypeScript compilation
- Prettier formatting

### 🧪 Testing
- Unit tests execution
- Test coverage (80%+)
- E2E tests

### 🔒 Security
- Dependency vulnerability audit
- Secrets leak detection
- SQL injection prevention

### ⚡ Performance
- Bundle size validation
- Memory leak detection
- Query optimization

### 📚 Documentation
- README updates
- API documentation
- Changelog entries

### 🚀 Deployment
- Docker image build
- Environment configuration
- Database migrations

### 📊 Monitoring
- Logging configuration
- Health check endpoints
- Dashboard availability

### 💾 Backup
- Database backup strategy
- Recovery testing

### ⚙️ Configuration
- Production settings
- CORS policy
- Rate limiting

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Release Checklist
  uses: actions/checkout@v4

- name: Setup Node
  uses: actions/setup-node@v4

- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build

- name: Run Release Check
  run: npx release-check run --version ${{ github.ref_name }}
```

See [.github/workflows/release-check.yml](../.github/workflows/release-check.yml) for complete workflow example.

## Command Reference

| Command | Description | Options |
|---------|-------------|---------|
| `run` | Run full checklist | `--version`, `--skip-manual`, `--output`, `--category` |
| `list` | Show all items | `--category` |
| `check <id>` | Run single check | `--output` |

## Exit Codes

- `0` - All checks passed ✅
- `1` - Critical checks failed ❌

## Report Format

### Console Output

```
🚀 AutoFlow Pro Release Checklist
==================================

📋 [CQ001] ESLint 검사 통과
   Category: code_quality
   Severity: high
   Required: Yes
   ✅ Passed (1245ms)

📊 RELEASE CHECK SUMMARY
==================================================

📦 Version: 1.0.0
🎯 Score: 92/100 (Grade: A)

📈 Overall Statistics:
   Total Checks: 28
   ✅ Passed: 26
   ❌ Failed: 2
   ⚠️ Warnings: 0
   ⏭️ Skipped: 0
   ⏳ Pending: 0
   🤖 Automated: 24
   👤 Manual: 4
```

### Files Generated

- `release-check-{version}-{timestamp}.json` - Detailed JSON report
- `release-check-{version}-{timestamp}.md` - Markdown report

## Grading System

| Grade | Score Range | Meaning |
|-------|-------------|---------|
| A | 90-100 | Ready for release ✅ |
| B | 80-89 | Good, minor issues ⚠️ |
| C | 70-79 | Acceptable, review needed ⚠️ |
| D | 60-69 | Needs improvement ❌ |
| F | 0-59 | Not ready for release ❌ |

## Customization

### Add Custom Check

Edit `src/checklist.ts`:

```typescript
{
  id: 'CU001',
  category: ChecklistCategory.CODE_QUALITY,
  title: 'Custom Check',
  description: 'Your custom validation',
  severity: 'high',
  required: true,
  automated: true,
  command: 'your-command',
  validator: (output) => output.includes('success'),
}
```

## API Usage

```typescript
import { ReleaseCheckerService } from 'autoflow-release-check'
import { RELEASE_CHECKLIST } from 'autoflow-release-check'

const checker = new ReleaseCheckerService()
const report = await checker.runChecklist(RELEASE_CHECKLIST, {
  version: '1.0.0',
  skipManual: false,
  outputDir: './reports',
})

console.log(`Score: ${report.score}/100 (${report.grade})`)
```

## Best Practices

1. **Run before every release** - Make this part of your release process
2. **Address critical issues first** - Grade F/D requires immediate attention
3. **Review warnings** - Don't ignore warnings, they indicate potential issues
4. **Complete manual checks** - Automated checks are great, but manual review is still important
5. **Keep reports** - Store release reports for audit trail

## Troubleshooting

### Command Not Found

```bash
npm install -g autoflow-release-check
# or use npx
npx release-check run
```

### Permission Denied

```bash
chmod +x dist/cli.js
# or run with node
node dist/cli.js run
```

### Timeout Errors

Increase timeout in `checker.service.ts`:

```typescript
const { stdout, stderr } = await execAsync(item.command, {
  timeout: 600000, // 10 minutes
})
```

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines.

---

Made with ❤️ by AutoFlow Pro Team
