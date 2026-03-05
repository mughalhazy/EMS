import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { RoomEntity } from '../../event/src/entities/room.entity';
import { SpeakerEntity } from '../../speaker/src/entities/speaker.entity';
import { SessionController } from './session.controller';
import { SessionEntity } from './entities/session.entity';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { SessionLifecyclePublisher } from './session-lifecycle.publisher';
import { SessionService } from './session.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, SessionSpeakerEntity, SpeakerEntity, RoomEntity]), AuditModule],
  controllers: [SessionController],
  providers: [SessionService, SessionLifecyclePublisher],
  exports: [SessionService],
})
export class AgendaModule {}
