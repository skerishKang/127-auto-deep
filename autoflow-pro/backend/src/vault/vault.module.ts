import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Secret } from './entities/secret.entity'
import { VaultController } from './vault.controller'
import { VaultService } from './services/vault.service'
import { CryptoService } from './utils/crypto.service'
import { LocalVaultAdapter } from './adapters/local-vault.adapter'
import { HashiCorpVaultAdapter } from './adapters/hashicorp-vault.adapter'
import { VaultAdapter } from './adapters/vault-adapter.interface'

@Module({
  imports: [TypeOrmModule.forFeature([Secret])],
  controllers: [VaultController],
  providers: [
    VaultService,
    CryptoService,
    {
      provide: VaultAdapter,
      useFactory: () => {
        const useHashiCorpVault = process.env.USE_HASHICORP_VAULT === 'true'

        if (useHashiCorpVault) {
          return new HashiCorpVaultAdapter()
        }

        return new LocalVaultAdapter()
      },
    },
  ],
  exports: [VaultService, CryptoService],
})
export class VaultModule {}
