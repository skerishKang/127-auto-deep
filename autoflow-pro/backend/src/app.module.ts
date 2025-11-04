import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WorkflowsModule } from './workflows/workflows.module'
import { AuthModule } from './auth/auth.module'
import { VaultModule } from './vault/vault.module'
import { Workflow } from './workflows/entities/workflow.entity'
import { Node } from './workflows/entities/node.entity'
import { Edge } from './workflows/entities/edge.entity'
import { Run } from './workflows/entities/run.entity'
import { User } from './auth/entities/user.entity'
import { Role } from './auth/entities/role.entity'
import { Permission } from './auth/entities/permission.entity'
import { AuditLog } from './auth/entities/audit-log.entity'
import { Secret } from './vault/entities/secret.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'autoflow',
      entities: [Workflow, Node, Edge, Run, User, Role, Permission, AuditLog, Secret],
      synchronize: true,
    }),
    AuthModule,
    VaultModule,
    WorkflowsModule,
  ],
})
export class AppModule {}
