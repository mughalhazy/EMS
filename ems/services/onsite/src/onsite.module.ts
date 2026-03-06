import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendeeScheduleEntity } from '../../agenda/src/entities/attendee-schedule.entity';
import { SessionEntity } from '../../agenda/src/entities/session.entity';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { BadgePrintingService } from './badge-printing.service';
import { BadgeEntity } from './entities/badge.entity';
import { CheckInEntity } from './entities/check-in.entity';
import { ScanningDeviceEntity } from './entities/scanning-device.entity';
import { SessionAttendanceEntity } from './entities/session-attendance.entity';
import { SessionCheckInEntity } from './entities/session-check-in.entity';
import { OnsiteController } from './onsite.controller';
import { OnsiteEventsPublisher } from './onsite-events.publisher';
import { OnsiteService } from './onsite.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendeeEntity,
      AttendeeScheduleEntity,
      BadgeEntity,
      CheckInEntity,
      ScanningDeviceEntity,
      SessionAttendanceEntity,
      SessionCheckInEntity,
      SessionEntity,
    ]),
  ],
  controllers: [OnsiteController],
  providers: [OnsiteService, BadgePrintingService, OnsiteEventsPublisher],
  exports: [OnsiteService, BadgePrintingService],
})
export class OnsiteModule {}
