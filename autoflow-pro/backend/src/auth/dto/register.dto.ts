import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({
    description: '이름',
    example: 'John',
  })
  @IsString()
  firstName: string

  @ApiProperty({
    description: '성',
    example: 'Doe',
  })
  @IsString()
  lastName: string
}
