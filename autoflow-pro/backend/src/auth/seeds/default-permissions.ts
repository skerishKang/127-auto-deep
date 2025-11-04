import { Permission } from '../entities/permission.entity'
import { Role } from '../entities/role.entity'

export const DEFAULT_PERMISSIONS: Partial<Permission>[] = [
  // Workflow permissions
  { name: 'workflow:create', description: '워크플로우 생성 권한' },
  { name: 'workflow:read', description: '워크플로우 조회 권한' },
  { name: 'workflow:update', description: '워크플로우 수정 권한' },
  { name: 'workflow:delete', description: '워크플로우 삭제 권한' },
  { name: 'workflow:execute', description: '워크플로우 실행 권한' },
  { name: 'workflow:export', description: '워크플로우 내보내기 권한' },

  // User permissions
  { name: 'user:create', description: '사용자 생성 권한' },
  { name: 'user:read', description: '사용자 조회 권한' },
  { name: 'user:update', description: '사용자 수정 권한' },
  { name: 'user:delete', description: '사용자 삭제 권한' },
  { name: 'user:assign-role', description: '사용자에게 역할 할당 권한' },

  // Role permissions
  { name: 'role:create', description: '역할 생성 권한' },
  { name: 'role:read', description: '역할 조회 권한' },
  { name: 'role:update', description: '역할 수정 권한' },
  { name: 'role:delete', description: '역할 삭제 권한' },

  // Monitoring permissions
  { name: 'monitoring:read', description: '모니터링 데이터 조회 권한' },
  { name: 'monitoring:export', description: '모니터링 데이터 내보내기 권한' },

  // Template permissions
  { name: 'template:create', description: '템플릿 생성 권한' },
  { name: 'template:read', description: '템플릿 조회 권한' },
  { name: 'template:update', description: '템플릿 수정 권한' },
  { name: 'template:delete', description: '템플릿 삭제 권한' },
  { name: 'template:use', description: '템플릿 사용 권한' },

  // AI Service permissions
  { name: 'ai:use', description: 'AI 서비스 사용 권한' },

  // Audit permissions
  { name: 'audit:read', description: '감사 로그 조회 권한' },

  // Secret permissions
  { name: 'secret:create', description: '시크릿 생성 권한' },
  { name: 'secret:read', description: '시크릿 조회 권한' },
  { name: 'secret:update', description: '시크릿 수정 권한' },
  { name: 'secret:delete', description: '시크릿 삭제 권한' },
]

export const DEFAULT_ROLES: Array<{
  name: string
  description: string
  permissions: string[]
}> = [
  {
    name: 'super_admin',
    description: '슈퍼 관리자 (모든 권한)',
    permissions: [
      'workflow:create',
      'workflow:read',
      'workflow:update',
      'workflow:delete',
      'workflow:execute',
      'workflow:export',
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:assign-role',
      'role:create',
      'role:read',
      'role:update',
      'role:delete',
      'monitoring:read',
      'monitoring:export',
      'template:create',
      'template:read',
      'template:update',
      'template:delete',
      'template:use',
      'ai:use',
      'audit:read',
      'secret:create',
      'secret:read',
      'secret:update',
      'secret:delete',
    ],
  },
  {
    name: 'admin',
    description: '관리자 (워크플로우 및 사용자 관리)',
    permissions: [
      'workflow:create',
      'workflow:read',
      'workflow:update',
      'workflow:delete',
      'workflow:execute',
      'user:read',
      'monitoring:read',
      'template:read',
      'template:use',
      'ai:use',
      'secret:create',
      'secret:read',
      'secret:update',
    ],
  },
  {
    name: 'user',
    description: '일반 사용자 (워크플로우 실행 및 조회)',
    permissions: [
      'workflow:read',
      'workflow:execute',
      'monitoring:read',
      'template:read',
      'template:use',
      'ai:use',
      'secret:read',
    ],
  },
  {
    name: 'viewer',
    description: '조회 전용 사용자',
    permissions: ['workflow:read', 'monitoring:read', 'template:read', 'secret:read'],
  },
]
