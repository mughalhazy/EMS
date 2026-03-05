import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { EventController } from './event.controller';
import { EventSettingController } from './event-setting.controller';
import { EventSettingService } from './event-setting.service';
import { EventSearchIndexService } from './event-search-index.service';
import { EventLifecyclePublisher } from './event-lifecycle.publisher';
import { EventService } from './event.service';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { SessionService } from './session.service';
import { EventEntity } from './entities/event.entity';
import { EventSettingEntity } from './entities/event-setting.entity';
import { RegistrationAnswerEntity } from './entities/registration-answer.entity';
import { RegistrationQuestionEntity } from './entities/registration-question.entity';
import { RoomEntity } from './entities/room.entity';
import { VenueEntity } from './entities/venue.entity';
import { SessionEntity } from './entities/session.entity';
import { SpeakerEntity } from './entities/speaker.entity';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';
import { SessionCapacityService } from './session-capacity.service';
import { SessionLifecyclePublisher } from './session-lifecycle.publisher';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      EventSettingEntity,
      VenueEntity,
      RoomEntity,
      RegistrationQuestionEntity,
      RegistrationAnswerEntity,
      SessionEntity,
      SpeakerEntity,
      SessionSpeakerEntity,
    ]),
    AuditModule,
  ],
  controllers: [
    EventController,
    EventSettingController,
    VenueController,
    RoomController,
    SpeakerAssignmentController,
  ],
  providers: [
    EventService,
    EventSearchIndexService,
    EventLifecyclePublisher,
    EventSettingService,
    VenueService,
    RoomService,
    SessionService,
    SessionLifecyclePublisher,
  ],
  exports: [EventService, EventSettingService, VenueService, RoomService, SessionService],
})
export class EventModule {}
