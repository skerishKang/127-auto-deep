import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AIService, AITask } from './ai.service'

@ApiTags('ai-services')
@Controller('api/v1/ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('execute')
  @ApiOperation({ summary: 'AI 작업 실행' })
  @ApiResponse({
    status: 200,
    description: 'AI 작업이 성공적으로 실행되었습니다.',
  })
  async executeTask(@Body() task: AITask) {
    if (!task.provider || !task.input) {
      throw new Error('provider와 input은 필수입니다.')
    }

    const result = await this.aiService.executeTask(task)
    return result
  }

  @Get('test')
  @ApiOperation({ summary: 'AI 서비스 연결 테스트' })
  async testConnection(@Query('provider') provider: 'openai' | 'anthropic') {
    if (!provider) {
      throw new Error('provider는 필수입니다.')
    }

    const isConnected = await this.aiService.testConnection(provider)
    return {
      provider,
      connected: isConnected,
    }
  }

  @Get('models')
  @ApiOperation({ summary: '사용 가능한 모델 목록 조회' })
  async getAvailableModels(@Query('provider') provider: 'openai' | 'anthropic') {
    if (!provider) {
      throw new Error('provider는 필수입니다.')
    }

    const models = this.aiService.getAvailableModels(provider)
    return {
      provider,
      models,
    }
  }
}
