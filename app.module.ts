import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WorkflowsModule } from './workflows/workflows.module'
import { CodeExecutionModule } from './code-execution/code-execution.module'
import { AIModule } from './ai-services/ai.module'
import { TemplateModule } from './templates/template.module'
import { MonitoringModule } from './monitoring/monitoring.module'
import { Workflow } from './workflows/entities/workflow.entity'
import { Node } from './workflows/entities/node.entity'
import { Edge } from './workflows/entities/edge.entity'
import { Run } from './workflows/entities/run.entity'

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
      entities: [Workflow, Node, Edge, Run],
      synchronize: true,
    }),
    WorkflowsModule,
    CodeExecutionModule,
    AIModule,
    TemplateModule,
    MonitoringModule,
  ],
})
export class AppModule {}
