import { Injectable, OnModuleInit } from '@nestjs/common'
import * as crypto from 'crypto'

@Injectable()
export class CryptoService implements OnModuleInit {
  private masterKey: string
  private algorithm = 'aes-256-gcm'
  private keyLength = 32
  private ivLength = 16
  private authTagLength = 16

  async onModuleInit() {
    this.masterKey = process.env.VAULT_MASTER_KEY || this.generateMasterKey()
    if (!process.env.VAULT_MASTER_KEY) {
      console.warn('⚠️  VAULT_MASTER_KEY not set. Generated temporary key.')
      console.warn('Please set VAULT_MASTER_KEY environment variable for production.')
    }
  }

  private generateMasterKey(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  encrypt(plaintext: string, key?: string): string {
    const encryptionKey = key || this.masterKey
    const keyBuffer = Buffer.from(encryptionKey, 'hex').slice(0, this.keyLength)
    const iv = crypto.randomBytes(this.ivLength)

    const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv)

    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    const result = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ]).toString('base64')

    return result
  }

  decrypt(encryptedData: string, key?: string): string {
    const encryptionKey = key || this.masterKey
    const keyBuffer = Buffer.from(encryptionKey, 'hex').slice(0, this.keyLength)

    const buffer = Buffer.from(encryptedData, 'base64')

    const iv = buffer.slice(0, this.ivLength)
    const authTag = buffer.slice(this.ivLength, this.ivLength + this.authTagLength)
    const encrypted = buffer.slice(this.ivLength + this.authTagLength)

    const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  generateRandomSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  hashSecret(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex')
  }
}
