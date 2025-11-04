import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'

export interface JwtPayload {
  sub: string
  email: string
  roles: string[]
  permissions: string[]
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['roles', 'roles.permissions'],
    })

    if (!user || !user.isActive) {
      throw new UnauthorizedException('사용자가 비활성화되었거나 존재하지 않습니다')
    }

    const permissions = this.extractPermissions(user)

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
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
}
