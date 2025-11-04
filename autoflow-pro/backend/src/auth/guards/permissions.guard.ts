import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export const PERMISSIONS_KEY = 'permissions'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredPermissions) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user || !user.permissions) {
      return false
    }

    return requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    )
  }
}
