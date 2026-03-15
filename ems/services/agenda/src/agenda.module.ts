import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { RoomEntity } from '../../event/src/entities/room.entity';
import { SpeakerEntity } from '../../speaker/src/entities/speaker.entity';
import { SessionController } from './session.controller';
import { AttendeeScheduleEntity } from './entities/attendee-schedule.entity';
import { SessionEntity } from './entities/session.entity';
import { SessionQnaEntity } from './entities/session-qna.entity';
import { TrackEntity } from './entities/track.entity';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { SessionAttendancePublisher } from './session-attendance.publisher';
import { SessionLifecyclePublisher } from './session-lifecycle.publisher';
import { SessionService } from './session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionEntity,
      SessionSpeakerEntity,
      AttendeeScheduleEntity,
      SessionQnaEntity,
      TrackEntity,
      AttendeeEntity,
      SpeakerEntity,
      RoomEntity,
    ]),
    AuditModule,
  ],
  controllers: [SessionController],
  providers: [SessionService, SessionLifecyclePublisher, SessionAttendancePublisher],
  exports: [SessionService],
})
export class AgendaModule {}
