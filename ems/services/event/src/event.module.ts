import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventController } from './event.controller';
import { EventLifecyclePublisher } from './event-lifecycle.publisher';
import { EventSearchIndexService } from './event-search-index.service';
import { EventSettingController } from './event-setting.controller';
import { EventSettingService } from './event-setting.service';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';
import { EventEntity } from './entities/event.entity';
import { EventSettingEntity } from './entities/event-setting.entity';
import { RoomEntity } from './entities/room.entity';
import { VenueEntity } from './entities/venue.entity';
import { EventService } from './event.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventSettingEntity, VenueEntity, RoomEntity])],
  controllers: [EventController, EventSettingController, VenueController, RoomController],
  providers: [
    EventService,
    EventSettingService,
    VenueService,
    RoomService,
    EventSearchIndexService,
    EventLifecyclePublisher,
  ],
  exports: [
    EventService,
    EventSettingService,
    VenueService,
    RoomService,
    EventSearchIndexService,
    EventLifecyclePublisher,
  ],
})
export class EventModule {}
