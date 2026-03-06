import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { NetworkingController } from './networking.controller';
import { AttendeeConnectionEntity } from './entities/attendee-connection.entity';
import { NetworkingEventsPublisher } from './networking-events.publisher';
import { NetworkingService } from './networking.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendeeConnectionEntity, AttendeeEntity]), AuditModule],
  controllers: [NetworkingController],
  providers: [NetworkingService, NetworkingEventsPublisher],
  exports: [NetworkingService, NetworkingEventsPublisher],
})
export class NetworkingModule {}
