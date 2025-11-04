export interface VaultAdapter {
  getSecret(key: string): Promise<string | null>
  setSecret(key: string, value: string): Promise<void>
  deleteSecret(key: string): Promise<void>
  listSecrets(prefix?: string): Promise<string[]>
  isHealthy(): Promise<boolean>
}
