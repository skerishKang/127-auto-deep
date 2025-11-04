import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Run } from '../../workflows/entities/run.entity'

export class RunHistoryDto {
  @ApiProperty({ description: '실행 ID' })
  id: string

  @ApiProperty({ description: '워크플로우 ID' })
  workflowId: string

  @ApiProperty({ description: '실행 상태', enum: ['running', 'success', 'error'] })
  status: string

  @ApiProperty({ description: '실행 시작 시간' })
  startedAt: Date

  @ApiPropertyOptional({ description: '실행 종료 시간' })
  endedAt?: Date

  @ApiPropertyOptional({ description: '입력 데이터' })
  input?: any

  @ApiPropertyOptional({ description: '출력 데이터' })
  output?: any

  @ApiPropertyOptional({ description: '로그 목록' })
  logs?: Array<{
    nodeId: string
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
    data?: any
  }>

  @ApiPropertyOptional({ description: '에러 정보' })
  error?: {
    nodeId: string
    message: string
    stack?: string
  }

  @ApiPropertyOptional({ description: '실행 메트릭' })
  metrics?: {
    duration: number
    nodeMetrics: Record<string, any>
  }
}

export class RunHistoryResponseDto {
  @ApiProperty({ type: [RunHistoryDto], description: '실행 이력 목록' })
  data: RunHistoryDto[]

  @ApiProperty({ description: '총 개수' })
  total: number
}
