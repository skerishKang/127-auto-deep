import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Workflow } from './workflow.entity'

@Entity('edges')
export class Edge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  workflowId: string

  @ManyToOne(() => Workflow, (workflow) => workflow.edges, { onDelete: 'CASCADE' })
  workflow: Workflow

  @Column()
  source: string

  @Column()
  target: string

  @Column({ type: 'text', nullable: true })
  label: string

  @Column({ nullable: true })
  condition: string

  @Column({ type: 'jsonb', nullable: true })
  sourceHandle: string

  @Column({ type: 'jsonb', nullable: true })
  targetHandle: string
}
