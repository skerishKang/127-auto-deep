import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Workflow } from './workflow.entity'

@Entity('nodes')
export class Node {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  workflowId: string

  @ManyToOne(() => Workflow, (workflow) => workflow.nodes, { onDelete: 'CASCADE' })
  workflow: Workflow

  @Column()
  type: string

  @Column({ type: 'jsonb' })
  position: {
    x: number
    y: number
  }

  @Column({ type: 'jsonb' })
  data: any
}
