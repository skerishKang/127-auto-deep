import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEnum, IsOptional, IsObject, IsDateString } from 'class-validator'
import { SecretType, SecretStatus } from '../entities/secret.entity'

export class UpdateSecretDto {
  @ApiProperty({
    description: '시크릿 이름',
    example: 'openai_api_key',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    description: '시크릿 설명',
    example: 'OpenAI API 키',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    enum: SecretType,
    description: '시크릿 유형',
    required: false,
  })
  @IsOptional()
  @IsEnum(SecretType)
  type?: SecretType

  @ApiProperty({
    enum: SecretStatus,
    description: '시크릿 상태',
    required: false,
  })
  @IsOptional()
  @IsEnum(SecretStatus)
  status?: SecretStatus

  @ApiProperty({
    description: '시크릿 값',
    example: 'sk-...',
    required: false,
  })
  @IsOptional()
  @IsString()
  value?: string

  @ApiProperty({
    description: '메타데이터',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @ApiProperty({
    description: '만료 날짜 (ISO 8601)',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string
}
