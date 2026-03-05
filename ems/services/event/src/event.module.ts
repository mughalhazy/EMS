import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventEntity } from './entities/event.entity';
import { RoomEntity } from './entities/room.entity';
import { VenueEntity } from './entities/venue.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { VenueController } from './venue.controller';
import { EventController } from './event.controller';
import { VenueService } from './venue.service';
import { EventService } from './event.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, VenueEntity, RoomEntity])],
  controllers: [EventController, VenueController, RoomController],
  providers: [EventService, VenueService, RoomService],
  exports: [EventService, VenueService, RoomService],
})
export class EventModule {}
