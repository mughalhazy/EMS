import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { RoomEntity } from '../../event/src/entities/room.entity';
import { SpeakerEntity } from '../../speaker/src/entities/speaker.entity';
import { SessionController } from './session.controller';
import { AttendeeScheduleEntity } from './entities/attendee-schedule.entity';
import { SessionEntity } from './entities/session.entity';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { SessionLifecyclePublisher } from './session-lifecycle.publisher';
import { SessionService } from './session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionEntity,
      SessionSpeakerEntity,
      AttendeeScheduleEntity,
      AttendeeEntity,
      SpeakerEntity,
      RoomEntity,
    ]),
    AuditModule,
  ],
  controllers: [SessionController],
  providers: [SessionService, SessionLifecyclePublisher],
  exports: [SessionService],
})
export class AgendaModule {}
