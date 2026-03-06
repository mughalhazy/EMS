import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { BadgePrintingService } from './badge-printing.service';
import { BadgeEntity } from './entities/badge.entity';
import { CheckInEntity } from './entities/check-in.entity';
import { OnsiteController } from './onsite.controller';
import { OnsiteService } from './onsite.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendeeEntity, BadgeEntity, CheckInEntity])],
  controllers: [OnsiteController],
  providers: [OnsiteService, BadgePrintingService],
  exports: [OnsiteService, BadgePrintingService],
})
export class OnsiteModule {}
