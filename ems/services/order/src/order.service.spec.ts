import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';

describe('OrderService.createOrder', () => {
  let service: OrderService;
  let orders: { create: jest.Mock; save: jest.Mock };
  let orderItems: { create: jest.Mock; save: jest.Mock };
  let ticketProducts: { find: jest.Mock };
  let eventBus: { publish: jest.Mock; subscribe: jest.Mock };
  let inventory: { reserve: jest.Mock };
  let pricing: { validateCode: jest.Mock; applyCode: jest.Mock };

  beforeEach(() => {
    orders = {
      create: jest.fn((v) => ({ id: 'order-1', ...v })),
      save: jest.fn(async (v) => v),
    };
    orderItems = {
      create: jest.fn((v) => v),
      save: jest.fn(async (v) => v),
    };
    ticketProducts = { find: jest.fn() };
    eventBus = { publish: jest.fn(), subscribe: jest.fn() };
    inventory = { reserve: jest.fn() };
    pricing = { validateCode: jest.fn(), applyCode: jest.fn() };

    service = new OrderService(
      orders as never,
      orderItems as never,
      ticketProducts as never,
      eventBus as never,
      inventory as never,
      pricing as never,
    );
  });

  it('prices order items from the ticket product catalog', async () => {
    ticketProducts.find.mockResolvedValue([
      { id: 'tp-1', price: 2500 },
      { id: 'tp-2', price: 1000 },
    ]);

    const { order, items } = await service.createOrder('tenant-1', 'user-1', {
      eventId: 'event-1',
      items: [
        { ticketProductId: 'tp-1', quantity: 2 },
        { ticketProductId: 'tp-2', quantity: 1 },
      ],
    });

    expect(inventory.reserve).toHaveBeenCalledWith('tp-1', 'tenant-1', 2);
    expect(inventory.reserve).toHaveBeenCalledWith('tp-2', 'tenant-1', 1);
    expect(order.subtotalCents).toBe(6000);
    expect(order.discountCents).toBe(0);
    expect(order.totalCents).toBe(6000);
    expect(items).toEqual([
      { orderId: 'order-1', ticketProductId: 'tp-1', quantity: 2, unitPriceCents: 2500, subtotalCents: 5000 },
      { orderId: 'order-1', ticketProductId: 'tp-2', quantity: 1, unitPriceCents: 1000, subtotalCents: 1000 },
    ]);
  });

  it('throws when a ticket product cannot be found', async () => {
    ticketProducts.find.mockResolvedValue([]);

    await expect(
      service.createOrder('tenant-1', 'user-1', {
        eventId: 'event-1',
        items: [{ ticketProductId: 'missing', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('applies a valid promo code discount to the subtotal', async () => {
    ticketProducts.find.mockResolvedValue([{ id: 'tp-1', price: 1000 }]);
    pricing.validateCode.mockResolvedValue({ id: 'promo-1' });
    pricing.applyCode.mockResolvedValue(300);

    const { order } = await service.createOrder('tenant-1', 'user-1', {
      eventId: 'event-1',
      items: [{ ticketProductId: 'tp-1', quantity: 1 }],
      promoCode: 'SAVE',
    });

    expect(pricing.applyCode).toHaveBeenCalledWith('promo-1', 'tenant-1', 1000);
    expect(order.subtotalCents).toBe(1000);
    expect(order.discountCents).toBe(300);
    expect(order.totalCents).toBe(700);
    expect(order.promoCodeId).toBe('promo-1');
  });

  it('rejects an invalid promo code', async () => {
    ticketProducts.find.mockResolvedValue([{ id: 'tp-1', price: 1000 }]);
    pricing.validateCode.mockResolvedValue(null);

    await expect(
      service.createOrder('tenant-1', 'user-1', {
        eventId: 'event-1',
        items: [{ ticketProductId: 'tp-1', quantity: 1 }],
        promoCode: 'BAD',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
