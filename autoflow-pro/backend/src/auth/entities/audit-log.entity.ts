import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { User } from './user.entity'

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @ManyToOne(() => User, (user) => user.auditLogs)
  user: User

  @Column()
  action: string

  @Column({ nullable: true })
  resource: string

  @Column({ nullable: true })
  resourceId: string

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>

  @Column({ nullable: true })
  ipAddress: string

  @Column({ nullable: true })
  userAgent: string

  @Column()
  status: 'success' | 'failure'

  @Column({ type: 'text', nullable: true })
  errorMessage: string

  @CreateDateColumn()
  createdAt: Date
}
