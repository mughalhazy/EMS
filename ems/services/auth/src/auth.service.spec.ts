import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

describe('AuthService.updateStatus', () => {
  let service: AuthService;
  let users: { findOne: jest.Mock; save: jest.Mock };
  let eventBus: { publish: jest.Mock };

  beforeEach(() => {
    users = { findOne: jest.fn(), save: jest.fn() };
    eventBus = { publish: jest.fn() };

    service = new AuthService(
      users as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { sign: jest.fn() } as never,
      eventBus as never,
    );
  });

  it('rejects an invalid status', async () => {
    await expect(service.updateStatus('user-1', 'tenant-1', 'bogus')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('throws when the user is not found', async () => {
    users.findOne.mockResolvedValue(null);
    await expect(service.updateStatus('user-1', 'tenant-1', 'suspended')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates the status, persists it, and publishes user.status_changed', async () => {
    const user = {
      id: 'user-1',
      tenantId: 'tenant-1',
      email: 'a@b.com',
      name: 'A',
      status: 'active',
    } as User;
    users.findOne.mockResolvedValue(user);
    users.save.mockResolvedValue(user);

    const result = await service.updateStatus('user-1', 'tenant-1', 'suspended');

    expect(user.status).toBe('suspended');
    expect(users.save).toHaveBeenCalledWith(user);
    expect(eventBus.publish).toHaveBeenCalledWith('user.status_changed', {
      eventType: 'user.status_changed',
      tenantId: 'tenant-1',
      payload: { userId: 'user-1', status: 'suspended' },
    });
    expect(result).toEqual({
      id: 'user-1',
      tenantId: 'tenant-1',
      email: 'a@b.com',
      name: 'A',
      status: 'suspended',
    });
  });
});
