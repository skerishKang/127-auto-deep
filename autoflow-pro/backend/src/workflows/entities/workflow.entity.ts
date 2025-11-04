import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm'
import { Node } from './node.entity'
import { Edge } from './edge.entity'
import { Run } from './run.entity'
import { User } from '../../auth/entities/user.entity'

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ default: 'v1' })
  version: string

  @Column({ default: 'draft' })
  status: string

  @Column()
  projectId: string

  @Column({ type: 'jsonb' })
  graphJson: {
    nodes: any[]
    edges: any[]
  }

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.workflows)
  createdBy: User

  @OneToMany(() => Node, (node) => node.workflow, { cascade: true })
  nodes: Node[]

  @OneToMany(() => Edge, (edge) => edge.workflow, { cascade: true })
  edges: Edge[]

  @OneToMany(() => Run, (run) => run.workflow)
  runs: Run[]
}
