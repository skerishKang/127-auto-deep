import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Logger } from '@nestjs/common'
import { Secret, SecretStatus } from '../entities/secret.entity'
import { CreateSecretDto } from '../dto/create-secret.dto'
import { UpdateSecretDto } from '../dto/update-secret.dto'
import { CryptoService } from '../utils/crypto.service'
import { VaultAdapter } from '../adapters/vault-adapter.interface'

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name)

  constructor(
    @InjectRepository(Secret)
    private secretRepository: Repository<Secret>,
    private cryptoService: CryptoService,
    private vaultAdapter: VaultAdapter,
  ) {}

  async createSecret(
    createSecretDto: CreateSecretDto,
    createdBy: string,
  ): Promise<Secret> {
    const { value, ...dto } = createSecretDto

    const encryptedValue = this.cryptoService.encrypt(value)
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null

    const secret = this.secretRepository.create({
      ...dto,
      encryptedValue,
      expiresAt,
      createdBy,
      isEncrypted: true,
    })

    const savedSecret = await this.secretRepository.save(secret)

    try {
      await this.vaultAdapter.setSecret(savedSecret.id, value)
    } catch (error) {
      this.logger.warn(`Failed to sync to external vault: ${error.message}`)
    }

    return savedSecret
  }

  async getSecret(secretId: string, decrypt: boolean = false): Promise<Secret | null> {
    const secret = await this.secretRepository.findOne({
      where: { id: secretId },
    })

    if (!secret) {
      throw new NotFoundException(`Secret not found: ${secretId}`)
    }

    if (decrypt && secret.status === SecretStatus.ACTIVE) {
      try {
        const decryptedValue = this.cryptoService.decrypt(secret.encryptedValue)
        return { ...secret, encryptedValue: decryptedValue }
      } catch (error) {
        throw new BadRequestException(`Failed to decrypt secret: ${error.message}`)
      }
    }

    return secret
  }

  async getSecretByName(name: string, decrypt: boolean = false): Promise<Secret | null> {
    const secret = await this.secretRepository.findOne({
      where: { name },
    })

    if (!secret) {
      throw new NotFoundException(`Secret not found: ${name}`)
    }

    if (decrypt && secret.status === SecretStatus.ACTIVE) {
      try {
        const decryptedValue = this.cryptoService.decrypt(secret.encryptedValue)
        return { ...secret, encryptedValue: decryptedValue }
      } catch (error) {
        throw new BadRequestException(`Failed to decrypt secret: ${error.message}`)
      }
    }

    return secret
  }

  async getAllSecrets(userId?: string): Promise<Secret[]> {
    const where = userId ? { createdBy: userId } : {}
    return this.secretRepository.find({
      where,
      order: { createdAt: 'DESC' },
    })
  }

  async updateSecret(
    secretId: string,
    updateSecretDto: UpdateSecretDto,
    userId: string,
  ): Promise<Secret> {
    const secret = await this.getSecret(secretId)

    const updatedValues: Partial<Secret> = { ...updateSecretDto }

    if (updateSecretDto.value) {
      updatedValues.encryptedValue = this.cryptoService.encrypt(updateSecretDto.value)
      updatedValues.version = secret.version + 1
      updatedValues.previousVersionId = secret.id
    }

    if (updateSecretDto.expiresAt) {
      updatedValues.expiresAt = new Date(updateSecretDto.expiresAt)
    }

    const updatedSecret = await this.secretRepository.save({
      ...secret,
      ...updatedValues,
    })

    try {
      if (updateSecretDto.value) {
        await this.vaultAdapter.setSecret(secretId, updateSecretDto.value)
      }
    } catch (error) {
      this.logger.warn(`Failed to sync to external vault: ${error.message}`)
    }

    return updatedSecret
  }

  async deleteSecret(secretId: string): Promise<void> {
    const secret = await this.getSecret(secretId)

    await this.secretRepository.remove(secret)

    try {
      await this.vaultAdapter.deleteSecret(secretId)
    } catch (error) {
      this.logger.warn(`Failed to delete from external vault: ${error.message}`)
    }
  }

  async activateSecret(secretId: string): Promise<Secret> {
    const secret = await this.getSecret(secretId)

    secret.status = SecretStatus.ACTIVE
    return this.secretRepository.save(secret)
  }

  async deactivateSecret(secretId: string): Promise<Secret> {
    const secret = await this.getSecret(secretId)

    secret.status = SecretStatus.INACTIVE
    return this.secretRepository.save(secret)
  }

  async rotateSecret(secretId: string, newValue: string): Promise<Secret> {
    const secret = await this.getSecret(secretId)

    const newSecret = this.secretRepository.create({
      name: secret.name,
      description: secret.description,
      type: secret.type,
      encryptedValue: this.cryptoService.encrypt(newValue),
      isEncrypted: true,
      metadata: secret.metadata,
      version: secret.version + 1,
      previousVersionId: secret.id,
      createdBy: secret.createdBy,
    })

    return this.secretRepository.save(newSecret)
  }

  async checkHealth(): Promise<{
    database: boolean
    vault: boolean
    encryption: boolean
  }> {
    const database = await this.checkDatabaseHealth()
    const vault = await this.checkVaultHealth()
    const encryption = await this.checkEncryptionHealth()

    return { database, vault, encryption }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.secretRepository.count()
      return true
    } catch (error) {
      return false
    }
  }

  private async checkVaultHealth(): Promise<boolean> {
    try {
      return await this.vaultAdapter.isHealthy()
    } catch (error) {
      return false
    }
  }

  private async checkEncryptionHealth(): Promise<boolean> {
    try {
      const testText = 'test-encryption-health-check'
      const encrypted = this.cryptoService.encrypt(testText)
      const decrypted = this.cryptoService.decrypt(encrypted)
      return decrypted === testText
    } catch (error) {
      return false
    }
  }
}
