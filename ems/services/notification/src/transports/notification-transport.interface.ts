export interface NotificationDeliveryRequest {
  channel: string;
  recipientAddress?: string;
  subject?: string;
  body: string;
}

export interface NotificationDeliveryResult {
  success: boolean;
  error?: string;
}

export interface NotificationTransport {
  send(notification: NotificationDeliveryRequest): Promise<NotificationDeliveryResult>;
}

export const NOTIFICATION_TRANSPORT = Symbol('NOTIFICATION_TRANSPORT');
