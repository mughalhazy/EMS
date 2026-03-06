import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { NetworkingController } from './networking.controller';
import { AttendeeConnectionEntity } from './entities/attendee-connection.entity';
import { NetworkingEventsPublisher } from './networking-events.publisher';
import { NetworkingService } from './networking.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendeeConnectionEntity, AttendeeEntity])],
  controllers: [NetworkingController],
  providers: [NetworkingService, NetworkingEventsPublisher],
  exports: [NetworkingService, NetworkingEventsPublisher],
})
export class NetworkingModule {}
