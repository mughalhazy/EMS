import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ok,
  paginated,
  JwtAuthGuard,
  CurrentUser,
  JwtPayload,
  RequirePermissions,
  PermissionsGuard,
} from '@ems/common';
import { AuditService } from './audit.service';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit:read')
  @ApiOperation({ summary: 'List audit log entries for the current tenant' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const result = await this.auditService.findAll(user.tenantId, cursor, limit ? +limit : 20);
    return paginated(result.data, result.nextCursor ?? null);
  }

  @Get(':id')
  @RequirePermissions('audit:read')
  @ApiOperation({ summary: 'Get a single audit log entry' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return ok(await this.auditService.findOne(id, user.tenantId));
  }
}
