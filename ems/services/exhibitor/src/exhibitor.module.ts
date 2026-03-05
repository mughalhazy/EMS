import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { EventEntity } from '../../event/src/entities/event.entity';
import { VenueEntity } from '../../event/src/entities/venue.entity';
import { BoothEntity } from './entities/booth.entity';
import { ExhibitorEntity } from './entities/exhibitor.entity';
import { ExhibitorManagementController } from './exhibitor-management.controller';
import { ExhibitorManagementService } from './exhibitor-management.service';

@Module({
  imports: [
    AuditModule,
    TypeOrmModule.forFeature([EventEntity, VenueEntity, ExhibitorEntity, BoothEntity]),
  ],
  controllers: [ExhibitorManagementController],
  providers: [ExhibitorManagementService],
  exports: [ExhibitorManagementService],
})
export class ExhibitorModule {}
