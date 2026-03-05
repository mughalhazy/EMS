import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventController } from './event.controller';
import { EventEntity } from './entities/event.entity';
import { RoomEntity } from './entities/room.entity';
import { VenueEntity } from './entities/venue.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { EventSearchIndexService } from './event-search-index.service';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';
import { EventService } from './event.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, VenueEntity, RoomEntity])],
  controllers: [EventController, VenueController, RoomController],
  providers: [EventService, VenueService, RoomService, EventSearchIndexService],
  exports: [EventService, VenueService, RoomService, EventSearchIndexService],
})
export class EventModule {}
