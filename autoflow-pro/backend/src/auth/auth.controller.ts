import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshTokenDto } from './dto/token.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip
    const userAgent = req.headers['user-agent']

    return this.authService.register(registerDto, ipAddress, userAgent)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인', description: '사용자 로그인 및 JWT 토큰 발급' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '로그인 실패' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip
    const userAgent = req.headers['user-agent']

    return this.authService.login(loginDto, ipAddress, userAgent)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰으로 새로운 액세스 토큰을 발급받습니다',
  })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: '로그인된 사용자의 프로필 정보를 조회합니다',
  })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  getProfile(@CurrentUser() user: any) {
    return user
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '감사 로그 조회',
    description: '현재 사용자의 감사 로그를 조회합니다',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', type: Number })
  @ApiResponse({ status: 200, description: '감사 로그 조회 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async getAuditLogs(
    @CurrentUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.authService.getAuditLogs(userId, page, limit)
  }
}
