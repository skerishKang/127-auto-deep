import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Exclude } from 'class-transformer'
import { Role } from './role.entity'
import { AuditLog } from './audit-log.entity'
import { Workflow } from '../../workflows/entities/workflow.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ default: true })
  isActive: boolean

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[]

  @OneToMany(() => Workflow, (workflow) => workflow.createdBy)
  workflows: Workflow[]

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[]

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }
}
