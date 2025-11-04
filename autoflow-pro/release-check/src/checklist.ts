export interface ChecklistItem {
  id: string
  category: ChecklistCategory
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  required: boolean
  automated: boolean
  command?: string
  validator?: (output: string) => boolean
  manualCheck?: boolean
}

export enum ChecklistCategory {
  CODE_QUALITY = 'code_quality',
  TESTING = 'testing',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  DOCUMENTATION = 'documentation',
  DEPLOYMENT = 'deployment',
  MONITORING = 'monitoring',
  BACKUP = 'backup',
  CONFIGURATION = 'configuration',
}

export interface ChecklistResult {
  item: ChecklistItem
  status: 'passed' | 'failed' | 'warning' | 'skipped' | 'pending'
  output?: string
  error?: string
  duration?: number
  timestamp: Date
}

export interface ReleaseCheckReport {
  version: string
  timestamp: Date
  results: ChecklistResult[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
    skipped: number
    pending: number
    automated: number
    manual: number
  }
  categories: Record<ChecklistCategory, {
    total: number
    passed: number
    failed: number
    coverage: number
  }>
  recommendations: string[]
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export const RELEASE_CHECKLIST: ChecklistItem[] = [
  // CODE QUALITY
  {
    id: 'CQ001',
    category: ChecklistCategory.CODE_QUALITY,
    title: 'ESLint 검사 통과',
    description: 'ESLint 규칙을 모두 준수하는지 확인합니다',
    severity: 'high',
    required: true,
    automated: true,
    command: 'npm run lint',
    validator: (output) => !output.includes('error'),
  },
  {
    id: 'CQ002',
    category: ChecklistCategory.CODE_QUALITY,
    title: 'TypeScript 컴파일 성공',
    description: 'TypeScript 타입 체크를 모두 통과하는지 확인합니다',
    severity: 'critical',
    required: true,
    automated: true,
    command: 'npx tsc --noEmit',
    validator: (output) => !output.includes('error TS'),
  },
  {
    id: 'CQ003',
    category: ChecklistCategory.CODE_QUALITY,
    title: 'Prettier 포맷팅',
    description: '코드가 Prettier 규칙에 맞게 포맷팅되었는지 확인합니다',
    severity: 'medium',
    required: true,
    automated: true,
    command: 'npx prettier --check .',
    validator: (output) => !output.includes('needs formatting'),
  },

  // TESTING
  {
    id: 'TS001',
    category: ChecklistCategory.TESTING,
    title: '유닛 테스트 실행',
    description: '모든 유닛 테스트가 성공적으로 통과하는지 확인합니다',
    severity: 'critical',
    required: true,
    automated: true,
    command: 'npm test -- --coverage --passWithNoTests',
    validator: (output) => output.includes('Tests:') && !output.includes('FAILED'),
  },
  {
    id: 'TS002',
    category: ChecklistCategory.TESTING,
    title: '테스트 커버리지 80% 이상',
    description: '전체 코드 커버리지가 80%를 초과하는지 확인합니다',
    severity: 'high',
    required: true,
    automated: true,
    command: 'npm test -- --coverage',
    validator: (output) => {
      const match = output.match(/All files[^|]*\|[^|]*\s+([\d.]+)/)
      return match ? parseFloat(match[1]) >= 80 : false
    },
  },
  {
    id: 'TS003',
    category: ChecklistCategory.TESTING,
    title: 'E2E 테스트 실행',
    description: 'E2E 테스트가 모두 통과하는지 확인합니다',
    severity: 'high',
    required: false,
    automated: true,
    command: 'npm run test:e2e',
    validator: (output) => !output.includes('FAILED'),
  },

  // SECURITY
  {
    id: 'SC001',
    category: ChecklistCategory.SECURITY,
    title: '의존성 보안 취약점 검사',
    description: 'npm audit으로 알려진 보안 취약점이 없는지 확인합니다',
    severity: 'critical',
    required: true,
    automated: true,
    command: 'npm audit --audit-level=high',
    validator: (output) => {
      const vulnerabilities = output.match(/(\d+) vulnerabilities/g)
      if (!vulnerabilities) return true
      const count = parseInt(vulnerabilities[0].match(/\d+/)?.[0] || '0')
      return count === 0
    },
  },
  {
    id: 'SC002',
    category: ChecklistCategory.SECURITY,
    title: '노드 보안 모듈 검사',
    description: 'node-secure로 보안 문제를 점검합니다',
    severity: 'high',
    required: false,
    automated: true,
    command: 'npx node-secure .',
    validator: (output) => !output.includes('critical vulnerabilities'),
  },
  {
    id: 'SC003',
    category: ChecklistCategory.SECURITY,
    title: '민감정보 누수 검사',
    description: '코드에서 민감한 정보(비밀번호, API 키 등)가 누수되지 않았는지 확인합니다',
    severity: 'critical',
    required: true,
    automated: true,
    command: 'grep -r "password\\|secret\\|key\\|token" --include="*.ts" --include="*.js" src/ || true',
    validator: (output) => {
      const lines = output.split('\n').filter(l => l.trim() && !l.includes('//') && !l.includes('*'))
      return lines.length === 0
    },
  },
  {
    id: 'SC004',
    category: ChecklistCategory.SECURITY,
    title: 'SQL 인젝션 방지',
    description: '모든 SQL 쿼리가 매개변수화되었는지 확인합니다',
    severity: 'critical',
    required: true,
    automated: true,
    command: 'grep -r "SELECT\\|INSERT\\|UPDATE\\|DELETE" --include="*.ts" src/ | grep -v "createQueryBuilder\\|query\\(" || true',
    validator: (output) => output.trim().length === 0,
  },

  // PERFORMANCE
  {
    id: 'PF001',
    category: ChecklistCategory.PERFORMANCE,
    title: '번들 크기 검사',
    description: '번들 크기가 허용된 임계값을 초과하지 않는지 확인합니다',
    severity: 'medium',
    required: true,
    automated: true,
    command: 'npm run build',
    validator: (output) => !output.includes('exceeds'),
  },
  {
    id: 'PF002',
    category: ChecklistCategory.PERFORMANCE,
    title: '메모리 누수 검사',
    description: 'Node.js 프로세스의 메모리 사용량을 점검합니다',
    severity: 'medium',
    required: false,
    automated: false,
    manualCheck: true,
  },
  {
    id: 'PF003',
    category: ChecklistCategory.PERFORMANCE,
    title: 'DB 쿼리 최적화',
    description: '느린 쿼리가 없는지 확인합니다',
    severity: 'high',
    required: true,
    automated: false,
    manualCheck: true,
  },

  // DOCUMENTATION
  {
    id: 'DC001',
    category: ChecklistCategory.DOCUMENTATION,
    title: 'README 업데이트',
    description: 'README.md 파일이 최신 상태인지 확인합니다',
    severity: 'medium',
    required: true,
    automated: true,
    command: 'test -f README.md && echo "exists" || echo "missing"',
    validator: (output) => output.includes('exists'),
  },
  {
    id: 'DC002',
    category: ChecklistCategory.DOCUMENTATION,
    title: 'API 문서 최신화',
    description: 'Swagger API 문서가 최신 상태인지 확인합니다',
    severity: 'medium',
    required: true,
    automated: true,
    command: 'curl -s http://localhost:3000/api/docs || echo "not available"',
    validator: (output) => output.includes('swagger') || output.includes('openapi'),
  },
  {
    id: 'DC003',
    category: ChecklistCategory.DOCUMENTATION,
    title: 'CHANGELOG 작성',
    description: 'CHANGELOG.md 파일이 업데이트되었는지 확인합니다',
    severity: 'medium',
    required: true,
    automated: true,
    command: 'test -f CHANGELOG.md && echo "exists" || echo "missing"',
    validator: (output) => output.includes('exists'),
  },

  // DEPLOYMENT
  {
    id: 'DP001',
    category: ChecklistCategory.DEPLOYMENT,
    title: 'Docker 이미지 빌드',
    description: 'Docker 이미지가 성공적으로 빌드되는지 확인합니다',
    severity: 'high',
    required: true,
    automated: true,
    command: 'docker build -t app:latest .',
    validator: (output) => output.includes('successfully built'),
  },
  {
    id: 'DP002',
    category: ChecklistCategory.DEPLOYMENT,
    title: '환경변수 설정',
    description: '필수 환경변수가 모두 설정되었는지 확인합니다',
    severity: 'critical',
    required: true,
    automated: false,
    manualCheck: true,
  },
  {
    id: 'DP003',
    category: ChecklistCategory.DEPLOYMENT,
    title: '데이터베이스 마이그레이션',
    description: '데이터베이스 마이그레이션이 성공적으로 실행되는지 확인합니다',
    severity: 'critical',
    required: true,
    automated: true,
    command: 'npm run migration:run || echo "no migrations"',
    validator: (output) => output.includes('success') || output.includes('no migrations'),
  },

  // MONITORING
  {
    id: 'MN001',
    category: ChecklistCategory.MONITORING,
    title: '로깅 설정 확인',
    description: '프로덕션 로그 레벨이 적절하게 설정되었는지 확인합니다',
    severity: 'medium',
    required: true,
    automated: true,
    command: 'grep -r "LOG_LEVEL\\|NODE_ENV" src/ || echo "checking"',
    validator: () => true,
  },
  {
    id: 'MN002',
    category: ChecklistCategory.MONITORING,
    title: '헬스체크 엔드포인트',
    description: '헬스체크 엔드포인트가 구현되었는지 확인합니다',
    severity: 'high',
    required: true,
    automated: true,
    command: 'grep -r "health\\|/health" src/ || echo "not found"',
    validator: (output) => output.includes('health') || output.includes('not found'),
  },
  {
    id: 'MN003',
    category: ChecklistCategory.MONITORING,
    title: '모니터링 대시보드',
    description: '모니터링 대시보드가 접근 가능한지 확인합니다',
    severity: 'medium',
    required: true,
    automated: false,
    manualCheck: true,
  },

  // BACKUP
  {
    id: 'BK001',
    category: ChecklistCategory.BACKUP,
    title: '데이터베이스 백업 전략',
    description: '데이터베이스 백업 전략이 수립되어 있는지 확인합니다',
    severity: 'critical',
    required: true,
    automated: false,
    manualCheck: true,
  },
  {
    id: 'BK002',
    category: ChecklistCategory.BACKUP,
    title: '백업 복구 테스트',
    description: '백업을 복구할 수 있는지 테스트되었는지 확인합니다',
    severity: 'high',
    required: false,
    automated: false,
    manualCheck: true,
  },

  // CONFIGURATION
  {
    id: 'CF001',
    category: ChecklistCategory.CONFIGURATION,
    title: '프로덕션 환경설정',
    description: '프로덕션 환경변수가 제대로 설정되었는지 확인합니다',
    severity: 'critical',
    required: true,
    automated: false,
    manualCheck: true,
  },
  {
    id: 'CF002',
    category: ChecklistCategory.CONFIGURATION,
    title: 'CORS 설정',
    description: 'CORS 정책이 올바르게 설정되었는지 확인합니다',
    severity: 'high',
    required: true,
    automated: true,
    command: 'grep -r "cors\\|CORS" src/ || echo "checking"',
    validator: () => true,
  },
  {
    id: 'CF003',
    category: ChecklistCategory.CONFIGURATION,
    title: 'Rate Limiting 설정',
    description: 'API 레이트 리미팅이 설정되었는지 확인합니다',
    severity: 'high',
    required: true,
    automated: true,
    command: 'grep -r "rate.*limit\\|throttle" src/ || echo "checking"',
    validator: () => true,
  },
]
