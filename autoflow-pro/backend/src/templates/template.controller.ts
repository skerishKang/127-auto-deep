import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { TemplateService } from './template.service'

@ApiTags('templates')
@Controller('api/v1/templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @ApiOperation({ summary: '템플릿 목록 조회' })
  async findAll() {
    return this.templateService.findAll()
  }

  @Get('categories')
  @ApiOperation({ summary: '카테고리 목록 조회' })
  async getCategories() {
    return this.templateService.getCategories()
  }

  @Get('difficulties')
  @ApiOperation({ summary: '난이도 목록 조회' })
  async getDifficulties() {
    return this.templateService.getDifficulties()
  }

  @Get('search')
  @ApiOperation({ summary: '템플릿 검색' })
  async search(@Query('keyword') keyword: string) {
    return this.templateService.search(keyword)
  }

  @Get('category/:category')
  @ApiOperation({ summary: '카테고리별 템플릿 조회' })
  async findByCategory(@Param('category') category: string) {
    return this.templateService.findByCategory(category)
  }

  @Get('difficulty/:difficulty')
  @ApiOperation({ summary: '난이도별 템플릿 조회' })
  async findByDifficulty(@Param('difficulty') difficulty: string) {
    return this.templateService.findByDifficulty(difficulty)
  }

  @Get(':id')
  @ApiOperation({ summary: '템플릿 상세 조회' })
  async findOne(@Param('id') id: string) {
    const template = await this.templateService.findById(id)
    if (!template) {
      throw new Error(`Template ${id} not found`)
    }
    return template
  }

  @Post(':id/instantiate')
  @ApiOperation({ summary: '템플릿 인스턴스화' })
  @ApiResponse({
    status: 201,
    description: '템플릿이 성공적으로 인스턴스화되었습니다.',
  })
  async instantiate(
    @Param('id') id: string,
    @Body() params: Record<string, any>,
  ) {
    const workflow = await this.templateService.instantiate(id, params)
    return workflow
  }
}
