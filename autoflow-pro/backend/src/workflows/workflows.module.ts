import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WorkflowsController } from './workflows.controller'
import { WorkflowsService } from './workflows.service'
import { Workflow } from './entities/workflow.entity'
import { Node } from './entities/node.entity'
import { Edge } from './entities/edge.entity'
import { Run } from './entities/run.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, Node, Edge, Run])],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
