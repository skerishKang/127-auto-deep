import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Response } from 'express'
import { CodeExecutionService } from './code-execution.service'

@ApiTags('code-execution')
@Controller('api/v1/code-execution')
export class CodeExecutionController {
  constructor(
    private readonly codeExecutionService: CodeExecutionService,
  ) {}

  @Post('execute')
  @ApiOperation({ summary: '코드 실행' })
  @ApiResponse({
    status: 200,
    description: '코드가 성공적으로 실행되었습니다.',
  })
  async executeCode(
    @Body()
    body: {
      language: 'python' | 'javascript'
      code: string
      packages?: string[]
      input?: any
    },
  ) {
    const { language, code, packages, input } = body

    if (!language || !code) {
      throw new Error('언어와 코드는 필수입니다.')
    }

    const result = await this.codeExecutionService.executeCode(
      language,
      code,
      packages,
      input,
    )

    return {
      success: !result.error,
      ...result,
    }
  }

  @Get('artifact/:executionId/:artifactPath')
  @ApiOperation({ summary: '아티팩트 다운로드' })
  async getArtifact(
    @Param('executionId') executionId: string,
    @Param('artifactPath') artifactPath: string,
    @Res() res: Response,
  ) {
    const content = await this.codeExecutionService.getArtifactContent(
      executionId,
      artifactPath,
    )

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${artifactPath}"`,
    })

    res.send(content)
  }

  @Get('packages/:language')
  @ApiOperation({ summary: '허용된 패키지 목록 조회' })
  async getAllowlistPackages(
    @Param('language') language: 'python' | 'javascript',
  ) {
    const packages = await this.codeExecutionService['allowlistPackages'][language]
    return {
      language,
      packages,
      count: packages.length,
    }
  }
}
