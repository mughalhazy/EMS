import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EventBusService } from '@ems/event-bus';
import { InventoryService } from '@ems/inventory';
import { PricingService } from '@ems/pricing';
import { TicketProduct } from '@ems/ticketing';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(TicketProduct) private readonly ticketProducts: Repository<TicketProduct>,
    private readonly eventBus: EventBusService,
    private readonly inventory: InventoryService,
    private readonly pricing: PricingService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      'order-service',
      ['payment.completed', 'payment.failed', 'fulfillment.completed'],
      async (event) => {
        const { eventType, tenantId, payload } = event as unknown as {
          eventType: string;
          tenantId: string;
          payload: { orderId: string; fulfillmentId?: string };
        };

        if (eventType === 'payment.completed') {
          const order = await this.orders.findOne({ where: { id: payload.orderId, tenantId } });
          if (!order || order.status !== 'created') return;
          const items = await this.orderItems.find({ where: { orderId: payload.orderId } });
          order.status = 'paid';
          await this.orders.save(order);
          await this.eventBus.publish('order.paid', {
            eventType: 'order.paid',
            tenantId,
            payload: {
              orderId: order.id,
              userId: order.userId,
              eventId: order.eventId,
              totalCents: order.totalCents,
              items: items.map((i) => ({
                ticketProductId: i.ticketProductId,
                quantity: i.quantity,
              })),
            },
          });
        }

        if (eventType === 'fulfillment.completed') {
          const order = await this.orders.findOne({ where: { id: payload.orderId, tenantId } });
          if (!order || order.status !== 'paid') return;
          order.status = 'fulfilled';
          await this.orders.save(order);
          await this.eventBus.publish('order.fulfilled', {
            eventType: 'order.fulfilled',
            tenantId,
            payload: { orderId: order.id, fulfillmentId: payload.fulfillmentId },
          });
        }
      },
    );
  }

  async createOrder(tenantId: string, userId: string, dto: CreateOrderDto) {
    // Reserve inventory for each item (throws if insufficient)
    for (const item of dto.items) {
      await this.inventory.reserve(item.ticketProductId, tenantId, item.quantity);
    }

    const ticketProducts = await this.ticketProducts.find({
      where: { id: In(dto.items.map((i) => i.ticketProductId)), tenantId },
    });
    const priceById = new Map(ticketProducts.map((tp) => [tp.id, tp]));

    let subtotalCents = 0;
    const itemPricing = dto.items.map((i) => {
      const ticketProduct = priceById.get(i.ticketProductId);
      if (!ticketProduct) {
        throw new NotFoundException(`Ticket product ${i.ticketProductId} not found`);
      }
      const itemSubtotal = ticketProduct.price * i.quantity;
      subtotalCents += itemSubtotal;
      return {
        ticketProductId: i.ticketProductId,
        quantity: i.quantity,
        unitPriceCents: ticketProduct.price,
        subtotalCents: itemSubtotal,
      };
    });

    let discountCents = 0;
    let promoCodeId: string | undefined;

    if (dto.promoCode) {
      const promo = await this.pricing.validateCode(dto.promoCode, dto.eventId, tenantId);
      if (!promo) throw new BadRequestException('Promo code is invalid, expired, or exhausted');
      promoCodeId = promo.id;
      discountCents = await this.pricing.applyCode(promo.id, tenantId, subtotalCents);
    }

    const order = this.orders.create({
      tenantId,
      userId,
      eventId: dto.eventId,
      status: 'created',
      subtotalCents,
      discountCents,
      totalCents: Math.max(0, subtotalCents - discountCents),
      promoCodeId,
    });
    await this.orders.save(order);

    const items = itemPricing.map((i) =>
      this.orderItems.create({
        orderId: order.id,
        ticketProductId: i.ticketProductId,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        subtotalCents: i.subtotalCents,
      }),
    );
    await this.orderItems.save(items);

    await this.eventBus.publish('order.created', {
      eventType: 'order.created',
      tenantId,
      payload: {
        orderId: order.id,
        userId,
        eventId: dto.eventId,
        items: dto.items.map((i) => ({ ticketProductId: i.ticketProductId, quantity: i.quantity })),
      },
    });
    return { order, items };
  }

  async findOrder(id: string, tenantId: string) {
    const order = await this.orders.findOne({ where: { id, tenantId } });
    if (!order) throw new NotFoundException('Order not found');
    const items = await this.orderItems.find({ where: { orderId: id } });
    return { ...order, items };
  }

  async listOrders(tenantId: string, userId?: string, cursor?: string, limit = 20) {
    const qb = this.orders
      .createQueryBuilder('o')
      .where('o.tenantId = :tenantId', { tenantId })
      .orderBy('o.createdAt', 'DESC')
      .take(limit + 1);
    if (userId) qb.andWhere('o.userId = :userId', { userId });
    if (cursor) qb.andWhere('o.id < :cursor', { cursor });
    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
  }

  async cancelOrder(id: string, tenantId: string) {
    const order = await this.orders.findOne({ where: { id, tenantId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'cancelled') throw new BadRequestException('Order already cancelled');
    if (order.status === 'fulfilled')
      throw new BadRequestException('Cannot cancel a fulfilled order');
    const items = await this.orderItems.find({ where: { orderId: id } });
    order.status = 'cancelled';
    await this.orders.save(order);
    await this.eventBus.publish('order.cancelled', {
      eventType: 'order.cancelled',
      tenantId,
      payload: {
        orderId: id,
        userId: order.userId,
        eventId: order.eventId,
        items: items.map((i) => ({ ticketProductId: i.ticketProductId, quantity: i.quantity })),
      },
    });
    return order;
  }
}
