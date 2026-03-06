import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { NetworkingController } from './networking.controller';
import { AttendeeConnectionEntity } from './entities/attendee-connection.entity';
import { NetworkingService } from './networking.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendeeConnectionEntity, AttendeeEntity])],
  controllers: [NetworkingController],
  providers: [NetworkingService],
  exports: [NetworkingService],
})
export class NetworkingModule {}
