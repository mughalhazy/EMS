import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { AiService } from './ai.service';

class LogInteractionDto {
  prompt: string;
  response?: string;
  context?: Record<string, unknown>;
}

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly svc: AiService) {}

  @Get('embeddings/:entityType/:entityId')
  @ApiOperation({ summary: 'Get the stored embedding for an entity' })
  async getEmbedding(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return ok(await this.svc.getEmbedding(entityType, entityId));
  }

  @Post('interactions')
  @ApiOperation({ summary: 'Log an AI interaction' })
  async logInteraction(@CurrentUser() u: JwtPayload, @Body() dto: LogInteractionDto) {
    return ok(
      await this.svc.logInteraction(u.tenantId, u.sub, dto.prompt, dto.response, dto.context),
    );
  }

  @Get('interactions')
  @ApiOperation({ summary: 'List recent AI interactions for the tenant' })
  async listInteractions(@CurrentUser() u: JwtPayload, @Query('limit') limit?: number) {
    return ok(await this.svc.listInteractions(u.tenantId, limit ? +limit : 20));
  }
}
