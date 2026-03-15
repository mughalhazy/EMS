import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { SpeakerController } from './speaker.controller';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { SpeakerEntity } from './entities/speaker.entity';
import { SpeakerProfileEntity } from './entities/speaker-profile.entity';
import { SpeakerService } from './speaker.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpeakerEntity, SpeakerProfileEntity, SessionSpeakerEntity]), AuditModule],
  controllers: [SpeakerController],
  providers: [SpeakerService],
  exports: [SpeakerService],
})
export class SpeakerModule {}
