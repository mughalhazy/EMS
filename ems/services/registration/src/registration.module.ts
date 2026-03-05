import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventSettingEntity } from '../../event/src/entities/event-setting.entity';
import { RegistrationEntity } from './entities/registration.entity';
import { RegistrationService } from './registration.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistrationEntity, EventSettingEntity])],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
