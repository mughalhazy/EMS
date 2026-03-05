import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventController } from './event.controller';
import { EventEntity } from './entities/event.entity';
import { EventSettingEntity } from './entities/event-setting.entity';
import { RoomEntity } from './entities/room.entity';
import { VenueEntity } from './entities/venue.entity';
import { EventController } from './event.controller';
import { EventSettingController } from './event-setting.controller';
import { EventSettingService } from './event-setting.service';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { EventSearchIndexService } from './event-search-index.service';
import { VenueController } from './venue.controller';
import { EventController } from './event.controller';
import { VenueService } from './venue.service';
import { EventService } from './event.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventSettingEntity, VenueEntity, RoomEntity])],
  controllers: [EventController, EventSettingController, VenueController, RoomController],
  providers: [EventService, EventSettingService, VenueService, RoomService],
  exports: [EventService, EventSettingService, VenueService, RoomService],
})
export class EventModule {}
