import { NotificationService } from './notification.service';

describe('NotificationService.send', () => {
  let service: NotificationService;
  let notifications: { create: jest.Mock; save: jest.Mock };
  let eventBus: { publish: jest.Mock };
  let transport: { send: jest.Mock };

  beforeEach(() => {
    notifications = {
      create: jest.fn((v) => ({ ...v })),
      save: jest.fn(async (v) => v),
    };
    eventBus = { publish: jest.fn() };
    transport = { send: jest.fn() };

    service = new NotificationService(
      {} as never,
      notifications as never,
      {} as never,
      eventBus as never,
      transport as never,
    );
  });

  it('marks the notification as sent and publishes notification.sent on success', async () => {
    transport.send.mockResolvedValue({ success: true });

    const record = await service.send('tenant-1', {
      userId: 'user-1',
      channel: 'email',
      recipientAddress: 'user@example.com',
      subject: 'Hi',
      body: 'Hello',
    });

    expect(transport.send).toHaveBeenCalledWith({
      channel: 'email',
      recipientAddress: 'user@example.com',
      subject: 'Hi',
      body: 'Hello',
    });
    expect(record.status).toBe('sent');
    expect(record.sentAt).toBeInstanceOf(Date);
    expect(eventBus.publish).toHaveBeenCalledWith('notification.sent', {
      eventType: 'notification.sent',
      tenantId: 'tenant-1',
      payload: { notificationId: undefined, userId: 'user-1', channel: 'email' },
    });
  });

  it('marks the notification as failed and publishes notification.failed on transport error', async () => {
    transport.send.mockResolvedValue({ success: false, error: 'boom' });

    const record = await service.send('tenant-1', {
      userId: 'user-1',
      channel: 'email',
      body: 'Hello',
    });

    expect(record.status).toBe('failed');
    expect(record.errorMessage).toBe('boom');
    expect(eventBus.publish).toHaveBeenCalledWith('notification.failed', {
      eventType: 'notification.failed',
      tenantId: 'tenant-1',
      payload: { notificationId: undefined, userId: 'user-1' },
    });
  });
});
