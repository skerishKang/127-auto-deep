import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm'
import { Workflow } from './workflow.entity'

@Entity('runs')
export class Run {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  workflowId: string

  @ManyToOne(() => Workflow, (workflow) => workflow.runs, { onDelete: 'CASCADE' })
  workflow: Workflow

  @Column({ default: 'running' })
  status: string

  @CreateDateColumn()
  startedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date

  @Column({ type: 'jsonb', nullable: true })
  input: any

  @Column({ type: 'jsonb', nullable: true })
  output: any

  @Column({ type: 'jsonb', nullable: true })
  logs: Array<{
    nodeId: string
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
    data?: any
  }>

  @Column({ type: 'jsonb', nullable: true })
  error: {
    nodeId: string
    message: string
    stack?: string
  }

  @Column({ type: 'jsonb', nullable: true })
  metrics: {
    duration: number
    nodeMetrics: Record<string, any>
  }
}
