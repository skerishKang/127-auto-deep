import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class TokenDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
  })
  @IsString()
  accessToken: string

  @ApiProperty({
    description: 'JWT 리프레시 토큰',
  })
  @IsString()
  refreshToken: string
}

export class RefreshTokenDto {
  @ApiProperty({
    description: '리프레시 토큰',
  })
  @IsString()
  refreshToken: string
}

export class AuthResponseDto {
  @ApiProperty({
    description: '사용자 정보',
  })
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    roles: string[]
    permissions: string[]
  }

  @ApiProperty({
    description: '토큰 정보',
  })
  tokens: TokenDto
}
