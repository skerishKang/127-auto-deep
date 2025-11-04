import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { VaultService } from './services/vault.service'
import { CreateSecretDto } from './dto/create-secret.dto'
import { UpdateSecretDto } from './dto/update-secret.dto'
import {
  SecretResponseDto,
  DecryptedSecretResponseDto,
  GetSecretValueDto,
} from './dto/secret-response.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../auth/guards/permissions.guard'
import { Permissions } from '../auth/decorators/permissions.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@ApiTags('vault')
@Controller('vault')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post('secrets')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:create')
  @ApiOperation({ summary: '시크릿 생성', description: '새로운 시크릿을 생성합니다' })
  @ApiResponse({ status: 201, description: '시크릿 생성 성공', type: SecretResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async createSecret(
    @Body() createSecretDto: CreateSecretDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.vaultService.createSecret(createSecretDto, userId)
  }

  @Get('secrets')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:read')
  @ApiOperation({ summary: '시크릿 목록 조회', description: '시크릿 목록을 조회합니다' })
  @ApiQuery({ name: 'decrypt', required: false, description: '값 복호화 여부', type: Boolean })
  @ApiResponse({ status: 200, description: '시크릿 목록 조회 성공', type: [SecretResponseDto] })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async getAllSecrets(
    @CurrentUser('id') userId: string,
    @Query('decrypt') decrypt?: boolean,
  ) {
    const secrets = await this.vaultService.getAllSecrets(userId)

    if (decrypt) {
      return secrets.map((secret) => ({
        ...secret,
        value: this.vaultService.getSecret(secret.id, true).then(s => s?.encryptedValue || ''),
      }))
    }

    return secrets
  }

  @Get('secrets/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:read')
  @ApiOperation({ summary: '시크릿 조회', description: '특정 시크릿을 조회합니다' })
  @ApiParam({ name: 'id', description: '시크릿 ID' })
  @ApiQuery({ name: 'decrypt', required: false, description: '값 복호화 여부', type: Boolean })
  @ApiResponse({ status: 200, description: '시크릿 조회 성공', type: SecretResponseDto })
  @ApiResponse({ status: 404, description: '시크릿을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async getSecret(
    @Param('id') id: string,
    @Query('decrypt') decrypt?: boolean,
  ) {
    return this.vaultService.getSecret(id, decrypt)
  }

  @Get('secrets/name/:name')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:read')
  @ApiOperation({ summary: '이름으로 시크릿 조회', description: '이름으로 시크릿을 조회합니다' })
  @ApiParam({ name: 'name', description: '시크릿 이름' })
  @ApiQuery({ name: 'decrypt', required: false, description: '값 복호화 여부', type: Boolean })
  @ApiResponse({ status: 200, description: '시크릿 조회 성공', type: SecretResponseDto })
  @ApiResponse({ status: 404, description: '시크릿을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async getSecretByName(
    @Param('name') name: string,
    @Query('decrypt') decrypt?: boolean,
  ) {
    return this.vaultService.getSecretByName(name, decrypt)
  }

  @Put('secrets/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:update')
  @ApiOperation({ summary: '시크릿 업데이트', description: '시크릿을 업데이트합니다' })
  @ApiParam({ name: 'id', description: '시크릿 ID' })
  @ApiResponse({ status: 200, description: '시크릿 업데이트 성공', type: SecretResponseDto })
  @ApiResponse({ status: 404, description: '시크릿을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async updateSecret(
    @Param('id') id: string,
    @Body() updateSecretDto: UpdateSecretDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.vaultService.updateSecret(id, updateSecretDto, userId)
  }

  @Delete('secrets/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:delete')
  @ApiOperation({ summary: '시크릿 삭제', description: '시크릿을 삭제합니다' })
  @ApiParam({ name: 'id', description: '시크릿 ID' })
  @ApiResponse({ status: 200, description: '시크릿 삭제 성공' })
  @ApiResponse({ status: 404, description: '시크릿을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async deleteSecret(@Param('id') id: string) {
    await this.vaultService.deleteSecret(id)
    return { message: 'Secret deleted successfully' }
  }

  @Post('secrets/:id/activate')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:update')
  @ApiOperation({ summary: '시크릿 활성화', description: '시크릿을 활성화합니다' })
  @ApiParam({ name: 'id', description: '시크릿 ID' })
  @ApiResponse({ status: 200, description: '시크릿 활성화 성공', type: SecretResponseDto })
  @ApiResponse({ status: 404, description: '시크릿을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async activateSecret(@Param('id') id: string) {
    return this.vaultService.activateSecret(id)
  }

  @Post('secrets/:id/deactivate')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:update')
  @ApiOperation({ summary: '시크릿 비활성화', description: '시크릿을 비활성화합니다' })
  @ApiParam({ name: 'id', description: '시크릿 ID' })
  @ApiResponse({ status: 200, description: '시크릿 비활성화 성공', type: SecretResponseDto })
  @ApiResponse({ status: 404, description: '시크릿을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async deactivateSecret(@Param('id') id: string) {
    return this.vaultService.deactivateSecret(id)
  }

  @Post('secrets/:id/rotate')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:update')
  @ApiOperation({ summary: '시크릿 로테이션', description: '시크릿을 새로운 값으로 로테이션합니다' })
  @ApiParam({ name: 'id', description: '시크릿 ID' })
  @ApiResponse({ status: 200, description: '시크릿 로테이션 성공', type: SecretResponseDto })
  @ApiResponse({ status: 404, description: '시크릿을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async rotateSecret(
    @Param('id') id: string,
    @Body('newValue') newValue: string,
  ) {
    return this.vaultService.rotateSecret(id, newValue)
  }

  @Get('health')
  @UseGuards(PermissionsGuard)
  @Permissions('secret:read')
  @ApiOperation({ summary: '보관소 상태 확인', description: '보관소의 상태를 확인합니다' })
  @ApiResponse({ status: 200, description: '보관소 상태 조회 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  async checkHealth() {
    return this.vaultService.checkHealth()
  }
}
