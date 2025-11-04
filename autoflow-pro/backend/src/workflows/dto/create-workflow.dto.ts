import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsObject, IsOptional } from 'class-validator'

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Sample Workflow' })
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  project_id: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: 'v1' })
  @IsString()
  version: string

  @ApiProperty()
  @IsObject()
  graph_json: {
    nodes: any[]
    edges: any[]
  }
}
