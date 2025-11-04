import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'
import { MonitoringService } from './monitoring.service'
import { WorkflowMetricsDto } from './dto/workflow-metrics.dto'
import { SystemMetricsDto } from './dto/system-metrics.dto'
import { WorkflowSummaryDto } from './dto/workflow-metrics.dto'
import { RunHistoryDto } from './dto/run-history.dto'

@ApiTags('monitoring')
@Controller('api/v1/monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('workflow/:workflowId')
  @ApiOperation({ summary: '워크플로우 상세 메트릭 조회', description: '특정 워크플로우의 실행 통계, 성공률, 에러 목록, 일별 통계를 조회합니다.' })
  @ApiParam({ name: 'workflowId', description: '워크플로우 ID' })
  @ApiResponse({ status: 200, description: '워크플로우 메트릭', type: WorkflowMetricsDto })
  @ApiResponse({ status: 404, description: '워크플로우를 찾을 수 없음' })
  async getWorkflowMetrics(@Param('workflowId') workflowId: string): Promise<WorkflowMetricsDto> {
    return this.monitoringService.getWorkflowMetrics(workflowId)
  }

  @Get('system')
  @ApiOperation({ summary: '시스템 전체 메트릭 조회', description: '시스템 전체의 실행 현황, 평균 성공률, 알림 등을 조회합니다.' })
  @ApiResponse({ status: 200, description: '시스템 메트릭', type: SystemMetricsDto })
  async getSystemMetrics(): Promise<SystemMetricsDto> {
    return this.monitoringService.getSystemMetrics()
  }

  @Get('workflows')
  @ApiOperation({ summary: '워크플로우 목록 및 기본 메트릭 조회', description: '모든 워크플로우의 목록과 기본 실행 통계를 조회합니다.' })
  @ApiResponse({ status: 200, description: '워크플로우 목록', type: [WorkflowSummaryDto] })
  async getWorkflowList(): Promise<WorkflowSummaryDto[]> {
    return this.monitoringService.getWorkflowList()
  }

  @Get('workflow/:workflowId/runs')
  @ApiOperation({ summary: '워크플로우 실행 이력 조회', description: '특정 워크플로우의 최근 실행 이력을 조회합니다.' })
  @ApiParam({ name: 'workflowId', description: '워크플로우 ID' })
  @ApiQuery({ name: 'limit', required: false, description: '조회할 실행 이력 수 (기본값: 50, 최대: 100)', type: Number })
  @ApiResponse({ status: 200, description: '실행 이력 목록', type: [RunHistoryDto] })
  @ApiResponse({ status: 404, description: '워크플로우를 찾을 수 없음' })
  async getRunHistory(
    @Param('workflowId') workflowId: string,
    @Query('limit') limit?: number,
  ): Promise<RunHistoryDto[]> {
    const parsedLimit = limit ? parseInt(limit.toString()) : 50
    return this.monitoringService.getRunHistory(workflowId, parsedLimit)
  }
}
