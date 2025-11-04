import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum SecretType {
  API_KEY = 'api_key',
  DB_PASSWORD = 'db_password',
  JWT_SECRET = 'jwt_secret',
  AWS_KEY = 'aws_key',
  OPENAI_KEY = 'openai_key',
  ANTHROPIC_KEY = 'anthropic_key',
  CUSTOM = 'custom',
}

export enum SecretStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('secrets')
export class Secret {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({
    type: 'enum',
    enum: SecretType,
    default: SecretType.CUSTOM,
  })
  type: SecretType

  @Column({
    type: 'enum',
    enum: SecretStatus,
    default: SecretStatus.ACTIVE,
  })
  status: SecretStatus

  @Column({ type: 'text' })
  encryptedValue: string

  @Column({ default: false })
  isEncrypted: boolean

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>

  @Column({ nullable: true })
  expiresAt: Date

  @Column({ default: 1 })
  version: number

  @Column({ nullable: true })
  previousVersionId: string

  @Column()
  createdBy: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
