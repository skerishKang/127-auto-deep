import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from '../entities/permission.entity'
import { Role } from '../entities/role.entity'
import { User } from '../entities/user.entity'
import * as bcrypt from 'bcrypt'
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from './default-permissions'

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedPermissions()
    await this.seedRoles()
    await this.createSuperAdmin()
  }

  private async seedPermissions() {
    const count = await this.permissionRepository.count()

    if (count === 0) {
      console.log('Seeding default permissions...')

      for (const permData of DEFAULT_PERMISSIONS) {
        const permission = this.permissionRepository.create(permData)
        await this.permissionRepository.save(permission)
      }

      console.log(`Created ${DEFAULT_PERMISSIONS.length} permissions`)
    }
  }

  private async seedRoles() {
    const count = await this.roleRepository.count()

    if (count === 0) {
      console.log('Seeding default roles...')

      for (const roleData of DEFAULT_ROLES) {
        const role = this.roleRepository.create({
          name: roleData.name,
          description: roleData.description,
        })

        await this.roleRepository.save(role)

        const permissions = await this.permissionRepository.findBy({
          name: roleData.permissions,
        })

        role.permissions = permissions
        await this.roleRepository.save(role)

        console.log(`Created role: ${role.name}`)
      }
    }
  }

  private async createSuperAdmin() {
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@autoflow.com' },
    })

    if (!existingAdmin) {
      console.log('Creating default super admin user...')

      const superAdminRole = await this.roleRepository.findOne({
        where: { name: 'super_admin' },
      })

      const admin = this.userRepository.create({
        email: 'admin@autoflow.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Super',
        lastName: 'Admin',
        roles: superAdminRole ? [superAdminRole] : [],
      })

      await this.userRepository.save(admin)

      console.log('Created super admin: admin@autoflow.com / admin123')
      console.log('⚠️  Please change the default password after first login!')
    }
  }
}
