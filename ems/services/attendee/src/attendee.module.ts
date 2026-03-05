import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegistrantProfileEntity } from '../../registration/src/entities/registrant-profile.entity';
import { RegistrationEntity } from '../../registration/src/entities/registration.entity';
import { UserEntity } from '../../user/src/entities/user.entity';
import { AttendeeEventsConsumer } from './attendee-events.consumer';
import { AttendeeService } from './attendee.service';
import { AttendeeEntity } from './entities/attendee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendeeEntity,
      RegistrationEntity,
      RegistrantProfileEntity,
      UserEntity,
    ]),
  ],
  providers: [AttendeeService, AttendeeEventsConsumer],
  exports: [AttendeeService],
})
export class AttendeeModule {}
