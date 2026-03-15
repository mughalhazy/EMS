import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Headers,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ListRegistrationsQueryDto } from './dto/list-registrations-query.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { ApproveRegistrationDto } from './dto/approve-registration.dto';
import { RegistrationEntity } from './entities/registration.entity';
import { RegistrationService } from './registration.service';
import { ApiResponseInterceptor } from '../../shared/src/api-response.interceptor';

@UseInterceptors(ApiResponseInterceptor)
@Controller('api/v1/tenants/:tenantId/registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}


  private assertIdempotencyKey(idempotencyKey: string | undefined): void {
    if (!idempotencyKey || idempotencyKey.trim().length === 0) {
      throw new BadRequestException('Idempotency-Key header is required.');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRegistration(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() payload: CreateRegistrationDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<RegistrationEntity> {
    this.assertIdempotencyKey(idempotencyKey);

    return this.registrationService.register({
      tenantId,
      eventId: payload.eventId,
      userId: payload.userId,
      ticketId: payload.ticketId,
      orderId: payload.orderId,
      orderItemId: payload.orderItemId,
      attendeeIndex: payload.attendeeIndex,
      profile: payload.profile,
    });
  }

  @Get()
  async listRegistrations(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query() query: ListRegistrationsQueryDto,
  ): Promise<RegistrationEntity[]> {
    return this.registrationService.list(tenantId, {
      eventId: query.eventId,
      userId: query.userId,
      status: query.status,
    });
  }

  @Patch(':registrationId')
  async updateRegistration(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('registrationId', ParseUUIDPipe) registrationId: string,
    @Body() payload: UpdateRegistrationDto,
  ): Promise<RegistrationEntity> {
    const updatedRegistration = await this.registrationService.update(registrationId, tenantId, {
      ticketId: payload.ticketId,
    });

    if (!updatedRegistration) {
      throw new NotFoundException('Registration not found in tenant.');
    }

    return updatedRegistration;
  }


  @Post(':registrationId/approve')
  async approveRegistration(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('registrationId', ParseUUIDPipe) registrationId: string,
    @Body() payload: ApproveRegistrationDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<RegistrationEntity> {
    this.assertIdempotencyKey(idempotencyKey);

    const approvedRegistration = await this.registrationService.approve(registrationId, tenantId, {
      actorUserId: payload.actorUserId ?? null,
    });

    if (!approvedRegistration) {
      throw new NotFoundException('Registration not found in tenant.');
    }

    return approvedRegistration;
  }

  @Post(':registrationId/cancel')
  async cancelRegistration(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('registrationId', ParseUUIDPipe) registrationId: string,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<RegistrationEntity> {
    this.assertIdempotencyKey(idempotencyKey);

    const cancelledRegistration = await this.registrationService.cancel(registrationId, tenantId);
    if (!cancelledRegistration) {
      throw new NotFoundException('Registration not found in tenant.');
    }

    return cancelledRegistration;
  }
}
