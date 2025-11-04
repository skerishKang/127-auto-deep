import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/user.entity'
import { AuditLog } from './entities/audit-log.entity'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshTokenDto } from './dto/token.dto'
import { TokenDto } from './dto/token.dto'

interface JwtTokenPayload {
  sub: string
  email: string
  roles: string[]
  permissions: string[]
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    })

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다')
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10)

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    })

    await this.userRepository.save(user)

    await this.auditLogRepository.save({
      userId: user.id,
      action: 'user:register',
      resource: 'user',
      resourceId: user.id,
      ipAddress,
      userAgent,
      status: 'success',
    })

    const tokens = await this.generateTokens(user)
    const userData = await this.getUserData(user)

    return {
      user: userData,
      tokens,
    }
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['roles', 'roles.permissions'],
    })

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다')
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    )

    if (!isPasswordValid) {
      await this.auditLogRepository.save({
        userId: user.id,
        action: 'user:login',
        resource: 'auth',
        ipAddress,
        userAgent,
        status: 'failure',
        errorMessage: 'Invalid password',
      })
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다')
    }

    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다')
    }

    user.lastLoginAt = new Date()
    await this.userRepository.save(user)

    await this.auditLogRepository.save({
      userId: user.id,
      action: 'user:login',
      resource: 'auth',
      ipAddress,
      userAgent,
      status: 'success',
    })

    const tokens = await this.generateTokens(user)
    const userData = await this.getUserData(user)

    return {
      user: userData,
      tokens,
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      })

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles', 'roles.permissions'],
      })

      if (!user || !user.isActive) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다')
      }

      const tokens = await this.generateTokens(user)
      const userData = await this.getUserData(user)

      return {
        user: userData,
        tokens,
      }
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다')
    }
  }

  private async generateTokens(user: User): Promise<TokenDto> {
    const payload: JwtTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: this.extractPermissions(user),
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRATION || '1h',
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    })

    return { accessToken, refreshToken }
  }

  private async getUserData(user: User) {
    const permissions = this.extractPermissions(user)

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      roles: user.roles.map((role) => role.name),
      permissions,
    }
  }

  private extractPermissions(user: User): string[] {
    const permissions = new Set<string>()
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        permissions.add(permission.name)
      })
    })
    return Array.from(permissions)
  }

  async getAuditLogs(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    })

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
