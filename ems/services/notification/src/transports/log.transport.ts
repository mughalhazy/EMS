import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationDeliveryRequest,
  NotificationDeliveryResult,
  NotificationTransport,
} from './notification-transport.interface';

/**
 * Fallback transport used when no real provider (e.g. SMTP) is configured.
 * Writes the notification to the application log instead of delivering it.
 */
@Injectable()
export class LogTransport implements NotificationTransport {
  private readonly logger = new Logger(LogTransport.name);

  async send(notification: NotificationDeliveryRequest): Promise<NotificationDeliveryResult> {
    this.logger.log(
      `[${notification.channel}] to=${notification.recipientAddress ?? 'unknown'} subject="${notification.subject ?? ''}" body="${notification.body}"`,
    );
    return { success: true };
  }
}
