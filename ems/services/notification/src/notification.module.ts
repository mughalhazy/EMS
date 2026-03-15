import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationMessageEntity } from './entities/notification-message.entity';
import { NotificationService } from './notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationMessageEntity])],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
