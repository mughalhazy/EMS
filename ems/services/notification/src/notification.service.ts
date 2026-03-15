import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  NotificationChannel,
  NotificationMessageEntity,
  NotificationMessageStatus,
} from './entities/notification-message.entity';

export type CreateNotificationMessageInput = {
  tenantId: string;
  eventId?: string | null;
  channel: NotificationChannel;
  recipientAddress: string;
  subject?: string | null;
  body: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationMessageEntity)
    private readonly notificationMessageRepository: Repository<NotificationMessageEntity>,
  ) {}

  async queueMessage(input: CreateNotificationMessageInput): Promise<NotificationMessageEntity> {
    const message = this.notificationMessageRepository.create({
      tenantId: input.tenantId,
      eventId: input.eventId ?? null,
      channel: input.channel,
      recipientAddress: input.recipientAddress,
      subject: input.subject ?? null,
      body: input.body,
      metadata: input.metadata ?? {},
      status: NotificationMessageStatus.PENDING,
    });

    return this.notificationMessageRepository.save(message);
  }
}
