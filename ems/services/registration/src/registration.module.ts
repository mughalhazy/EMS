import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { EventSettingEntity } from '../../event/src/entities/event-setting.entity';
import { RegistrationEntity } from './entities/registration.entity';
import { RegistrationService } from './registration.service';
import { RegistrationEventsPublisher } from './registration-events.publisher';

@Module({
  imports: [TypeOrmModule.forFeature([RegistrationEntity, EventSettingEntity]), AuditModule],
  providers: [RegistrationService, RegistrationEventsPublisher],
  exports: [RegistrationService],
})
export class RegistrationModule {}
