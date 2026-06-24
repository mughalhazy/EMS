import { OnsiteService } from './onsite.service';

describe('OnsiteService.onModuleInit', () => {
  let service: OnsiteService;
  let prints: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let eventBus: { subscribe: jest.Mock };
  let attendeeCreatedHandler: (event: unknown) => Promise<void>;

  beforeEach(() => {
    prints = {
      findOne: jest.fn(),
      create: jest.fn((v) => v),
      save: jest.fn(async (v) => v),
    };
    eventBus = {
      subscribe: jest.fn(async (_group, _topics, handler) => {
        attendeeCreatedHandler = handler;
      }),
    };

    service = new OnsiteService({} as never, prints as never, {} as never, eventBus as never);
  });

  it('subscribes to attendee.created', async () => {
    await service.onModuleInit();
    expect(eventBus.subscribe).toHaveBeenCalledWith(
      'onsite-service',
      ['attendee.created'],
      expect.any(Function),
    );
  });

  it('pre-generates a badge print record with 0 copies for a new attendee', async () => {
    await service.onModuleInit();
    prints.findOne.mockResolvedValue(null);

    await attendeeCreatedHandler({
      tenantId: 'tenant-1',
      payload: { attendeeId: 'attendee-1', eventId: 'event-1' },
    });

    expect(prints.create).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      eventId: 'event-1',
      attendeeId: 'attendee-1',
      copies: 0,
    });
    expect(prints.save).toHaveBeenCalled();
  });

  it('does not duplicate a badge print record for the same attendee', async () => {
    await service.onModuleInit();
    prints.findOne.mockResolvedValue({ id: 'existing' });

    await attendeeCreatedHandler({
      tenantId: 'tenant-1',
      payload: { attendeeId: 'attendee-1', eventId: 'event-1' },
    });

    expect(prints.create).not.toHaveBeenCalled();
    expect(prints.save).not.toHaveBeenCalled();
  });
});
