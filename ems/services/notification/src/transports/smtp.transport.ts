import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  NotificationDeliveryRequest,
  NotificationDeliveryResult,
  NotificationTransport,
} from './notification-transport.interface';

@Injectable()
export class SmtpTransport implements NotificationTransport {
  private readonly logger = new Logger(SmtpTransport.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor(config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: config.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: config.get<string>('SMTP_USER'),
        pass: config.get<string>('SMTP_PASSWORD'),
      },
    });
    this.fromAddress = config.get<string>('SMTP_FROM', 'no-reply@ems.local');
  }

  async send(notification: NotificationDeliveryRequest): Promise<NotificationDeliveryResult> {
    if (notification.channel !== 'email') {
      return { success: false, error: `SMTP transport cannot deliver channel '${notification.channel}'` };
    }
    if (!notification.recipientAddress) {
      return { success: false, error: 'Missing recipient address' };
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: notification.recipientAddress,
        subject: notification.subject,
        text: notification.body,
      });
      return { success: true };
    } catch (err) {
      this.logger.error(`Failed to send email to ${notification.recipientAddress}`, err as Error);
      return { success: false, error: (err as Error).message };
    }
  }
}
