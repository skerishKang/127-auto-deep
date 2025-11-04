import { ApiProperty } from '@nestjs/swagger'

export enum AlertType {
  HIGH_FAILURE_RATE = 'high_failure_rate',
  SLOW_EXECUTION = 'slow_execution',
  COST_SPIKE = 'cost_spike',
}

export class AlertDto {
  @ApiProperty({ enum: AlertType, description: '알림 유형' })
  type: AlertType

  @ApiProperty({ description: '알림 메시지' })
  message: string

  @ApiProperty({ description: '현재 값' })
  value: number

  @ApiProperty({ description: '임계값' })
  threshold: number

  @ApiProperty({ description: '알림 발생 시간 (ISO 8601)' })
  timestamp: string
}

export class SystemMetricsDto {
  @ApiProperty({ description: '활성 워크플로우 수' })
  activeWorkflows: number

  @ApiProperty({ description: '최근 24시간 실행 횟수' })
  totalRuns24h: number

  @ApiProperty({ description: '평균 성공률 (%)' })
  avgSuccessRate: number

  @ApiProperty({ description: '평균 실행시간 (밀리초)' })
  avgDuration: number

  @ApiProperty({ type: [AlertDto], description: '발생한 알림 목록' })
  alerts: AlertDto[]
}
