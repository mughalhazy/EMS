import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PollEntity } from './entities/poll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PollEntity])],
  exports: [TypeOrmModule],
})
export class EngagementModule {}
