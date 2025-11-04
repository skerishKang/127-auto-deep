import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'

export class SecretResponseDto {
  @ApiProperty({
    description: '시크릿 ID',
  })
  @IsString()
  id: string

  @ApiProperty({
    description: '시크릿 이름',
  })
  @IsString()
  name: string

  @ApiProperty({
    description: '시크릿 설명',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: '시크릿 유형',
  })
  @IsString()
  type: string

  @ApiProperty({
    description: '시크릿 상태',
  })
  @IsString()
  status: string

  @ApiProperty({
    description: '메타데이터',
  })
  @IsOptional()
  metadata?: Record<string, any>

  @ApiProperty({
    description: '만료 날짜',
  })
  @IsOptional()
  expiresAt?: Date

  @ApiProperty({
    description: '버전',
  })
  version: number

  @ApiProperty({
    description: '생성자',
  })
  createdBy: string

  @ApiProperty({
    description: '생성 날짜',
  })
  createdAt: Date

  @ApiProperty({
    description: '수정 날짜',
  })
  updatedAt: Date
}

export class DecryptedSecretResponseDto extends SecretResponseDto {
  @ApiProperty({
    description: '복호화된 시크릿 값',
  })
  @IsString()
  value: string
}

export class GetSecretValueDto {
  @ApiProperty({
    description: '복호화된 시크릿 값',
  })
  @IsString()
  value: string
}
