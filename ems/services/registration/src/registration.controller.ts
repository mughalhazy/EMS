import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ListRegistrationsQueryDto } from './dto/list-registrations-query.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { ApproveRegistrationDto } from './dto/approve-registration.dto';
import { RegistrationEntity } from './entities/registration.entity';
import { RegistrationService } from './registration.service';

@Controller('api/v1/tenants/:tenantId/registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRegistration(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() payload: CreateRegistrationDto,
  ): Promise<RegistrationEntity> {
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
  ): Promise<RegistrationEntity> {
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
  ): Promise<RegistrationEntity> {
    const cancelledRegistration = await this.registrationService.cancel(registrationId, tenantId);
    if (!cancelledRegistration) {
      throw new NotFoundException('Registration not found in tenant.');
    }

    return cancelledRegistration;
  }
}
