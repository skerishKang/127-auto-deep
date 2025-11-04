import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MonitoringController } from './monitoring.controller'
import { MonitoringService } from './monitoring.service'
import { Run } from '../workflows/entities/run.entity'
import { Workflow } from '../workflows/entities/workflow.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Run, Workflow])],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
