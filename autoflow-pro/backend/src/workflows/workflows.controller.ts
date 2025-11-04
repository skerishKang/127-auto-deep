import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { WorkflowsService } from './workflows.service'
import { CreateWorkflowDto } from './dto/create-workflow.dto'

@ApiTags('workflows')
@Controller('api/v1/workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @ApiOperation({ summary: '워크플로우 생성' })
  @ApiResponse({ status: 201, description: '워크플로우가 성공적으로 생성되었습니다.' })
  async create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowsService.create(createWorkflowDto)
  }

  @Get()
  @ApiOperation({ summary: '워크플로우 목록 조회' })
  async findAll(@Query('project_id') projectId?: string) {
    return this.workflowsService.findAll(projectId)
  }

  @Get(':id')
  @ApiOperation({ summary: '워크플로우 상세 조회' })
  async findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id)
  }

  @Put(':id')
  @ApiOperation({ summary: '워크플로우 업데이트' })
  async update(@Param('id') id: string, @Body() updateWorkflowDto: Partial<CreateWorkflowDto>) {
    return this.workflowsService.update(id, updateWorkflowDto)
  }

  @Post(':id:run')
  @ApiOperation({ summary: '워크플로우 테스트 실행' })
  @ApiResponse({ status: 202, description: '워크플로우 실행이 시작되었습니다.' })
  async run(@Param('id') id: string, @Body() input?: any) {
    return this.workflowsService.run(id, input)
  }

  @Get(':id/runs')
  @ApiOperation({ summary: '워크플로우 실행 이력 조회' })
  async getRuns(@Param('id') id: string) {
    return this.workflowsService.getRuns(id)
  }

  @Get('runs/:runId')
  @ApiOperation({ summary: '워크플로우 실행 상세 조회' })
  async getRun(@Param('runId') runId: string) {
    return this.workflowsService.getRun(runId)
  }
}
