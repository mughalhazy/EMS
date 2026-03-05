import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { EventEntity } from '../../event/src/entities/event.entity';
import { VenueEntity } from '../../event/src/entities/venue.entity';
import { BoothEntity } from './entities/booth.entity';
import { ExhibitorLeadCaptureEntity } from './entities/exhibitor-lead-capture.entity';
import { ExhibitorEntity } from './entities/exhibitor.entity';
import { ExhibitorEventsPublisher } from './exhibitor-events.publisher';
import { ExhibitorManagementController } from './exhibitor-management.controller';
import { ExhibitorManagementService } from './exhibitor-management.service';

@Module({
  imports: [
    AuditModule,
    TypeOrmModule.forFeature([
      EventEntity,
      VenueEntity,
      AttendeeEntity,
      ExhibitorEntity,
      ExhibitorLeadCaptureEntity,
      BoothEntity,
    ]),
  ],
  controllers: [ExhibitorManagementController],
  providers: [ExhibitorManagementService, ExhibitorEventsPublisher],
  exports: [ExhibitorManagementService],
})
export class ExhibitorModule {}
