import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Permission } from './permission.entity'

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(() => User, (user) => user.roles)
  users: User[]

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
  })
  permissions: Permission[]
}
