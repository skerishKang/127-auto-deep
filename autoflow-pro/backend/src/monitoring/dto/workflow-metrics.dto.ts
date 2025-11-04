import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ErrorInfoDto {
  @ApiProperty({ description: '에러 메시지' })
  message: string

  @ApiProperty({ description: '에러 발생 횟수' })
  count: number

  @ApiProperty({ description: '전체 실행 대비 에러 비율 (%)' })
  percentage: number
}

export class DailyStatsDto {
  @ApiProperty({ description: '날짜 (YYYY-MM-DD)' })
  date: string

  @ApiProperty({ description: '총 실행 횟수' })
  total: number

  @ApiProperty({ description: '성공한 실행 횟수' })
  success: number

  @ApiProperty({ description: '실패한 실행 횟수' })
  failed: number
}

export class WorkflowMetricsDto {
  @ApiProperty({ description: '워크플로우 ID' })
  workflowId: string

  @ApiProperty({ description: '총 실행 횟수' })
  totalRuns: number

  @ApiProperty({ description: '성공률 (%)' })
  successRate: number

  @ApiProperty({ description: '평균 실행시간 (밀리초)' })
  avgDuration: number

  @ApiProperty({ description: '95번째百分위 실행시간 (밀리초)' })
  p95Duration: number

  @ApiProperty({ type: [ErrorInfoDto], description: '상위 에러 목록' })
  topErrors: ErrorInfoDto[]

  @ApiProperty({ type: [DailyStatsDto], description: '일별 실행 통계 (최근 7일)' })
  dailyStats: DailyStatsDto[]
}

export class WorkflowSummaryDto {
  @ApiProperty({ description: '워크플로우 ID' })
  workflowId: string

  @ApiProperty({ description: '워크플로우 이름' })
  name: string

  @ApiProperty({ description: '총 실행 횟수' })
  totalRuns: number

  @ApiProperty({ description: '성공률 (%)' })
  successRate: number

  @ApiProperty({ description: '평균 실행시간 (밀리초)' })
  avgDuration: number
}
