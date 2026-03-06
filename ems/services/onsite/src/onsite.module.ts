import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { TicketFulfillmentEntity } from '../../commerce/src/entities/ticket-fulfillment.entity';
import { RegistrationEntity } from '../../registration/src/entities/registration.entity';
import { CheckInEntity } from './entities/check-in.entity';
import { ScanningDeviceEntity } from './entities/scanning-device.entity';
import { OnsiteController } from './onsite.controller';
import { OnsiteService } from './onsite.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CheckInEntity,
      ScanningDeviceEntity,
      AttendeeEntity,
      RegistrationEntity,
      TicketFulfillmentEntity,
    ]),
  ],
  controllers: [OnsiteController],
  providers: [OnsiteService],
  exports: [OnsiteService],
})
export class OnsiteModule {}
