import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { InventoryPoolEntity } from '../../inventory/src/entities/inventory-pool.entity';
import { CommerceEventsPublisher } from './commerce-events.publisher';
import { OrderItemAttendee, OrderItemEntity } from './entities/order-item.entity';
import {
  OrderEntity,
  OrderInventoryReservation,
  OrderStatus,
  OrderTotals,
} from './entities/order.entity';
import { RedisLockService } from './redis-lock.service';

export interface CreateOrderItemInput {
  inventoryId: string;
  quantity: number;
  unitPrice: number;
  attendees?: OrderItemAttendee[];
}

export interface CreateOrderInput {
  tenantId: string;
  status?: OrderStatus;
  totals?: Partial<OrderTotals>;
  reservations?: OrderInventoryReservation[];
  items?: CreateOrderItemInput[];
}

@Injectable()
export class OrderService {
  private readonly reservationTtlMs = Number(process.env.INVENTORY_RESERVATION_TTL_MS ?? 15 * 60_000);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(InventoryPoolEntity)
    private readonly inventoryRepository: Repository<InventoryPoolEntity>,
    private readonly redisLockService: RedisLockService,
    private readonly commerceEventsPublisher: CommerceEventsPublisher,
  ) {}

  async create(input: CreateOrderInput): Promise<OrderEntity> {
    const reservations = input.reservations ?? [];
    if (reservations.length > 0) {
      await this.reserveInventories(input.tenantId, reservations);
    }

    const order = this.orderRepository.create({
      tenantId: input.tenantId,
      status: input.status ?? OrderStatus.DRAFT,
      totals: this.normalizeTotals(input.totals),
      reservation: reservations.length > 0 ? reservations : null,
      reservationExpiresAt:
        reservations.length > 0 ? new Date(Date.now() + this.reservationTtlMs) : null,
    });

    const savedOrder = await this.orderRepository.save(order);

    if (input.items?.length) {
      const items = input.items.map((item) =>
        this.orderItemRepository.create({
          tenantId: input.tenantId,
          orderId: savedOrder.id,
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          attendees: this.normalizeAttendees(item),
        }),
      );

      await this.orderItemRepository.save(items);
      savedOrder.items = items;
    }

    await this.commerceEventsPublisher.publishOrderCreated(savedOrder);

    return savedOrder;
  }

  async update(
    tenantId: string,
    orderId: string,
    input: DeepPartial<OrderEntity>,
  ): Promise<OrderEntity | null> {
    const order = await this.findByTenantAndId(tenantId, orderId);
    if (!order) {
      return null;
    }

    if (input.totals) {
      input.totals = this.normalizeTotals(input.totals);
    }

    Object.assign(order, input);
    return this.orderRepository.save(order);
  }

  async updateStatus(
    tenantId: string,
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderEntity | null> {
    const order = await this.findByTenantAndId(tenantId, orderId);
    if (!order) {
      return null;
    }

    const reservations = order.reservation ?? [];
    if (reservations.length > 0) {
      if (status === OrderStatus.PLACED) {
        await this.commitInventories(tenantId, reservations);
        order.reservation = null;
        order.reservationExpiresAt = null;
      }

      if (status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED) {
        await this.releaseInventories(tenantId, reservations);
        order.reservation = null;
        order.reservationExpiresAt = null;
      }
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async findByTenant(tenantId: string): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });

    await Promise.all(orders.map((order) => this.expireReservationIfNeeded(order)));
    return orders;
  }

  async findByTenantAndId(
    tenantId: string,
    orderId: string,
  ): Promise<OrderEntity | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, tenantId },
      relations: ['items'],
    });

    if (!order) {
      return null;
    }

    await this.expireReservationIfNeeded(order);
    return order;
  }

  private async expireReservationIfNeeded(order: OrderEntity): Promise<void> {
    if (
      order.status !== OrderStatus.DRAFT ||
      !order.reservation?.length ||
      !order.reservationExpiresAt ||
      order.reservationExpiresAt.getTime() > Date.now()
    ) {
      return;
    }

    await this.releaseInventories(order.tenantId, order.reservation);
    order.reservation = null;
    order.reservationExpiresAt = null;
    await this.orderRepository.save(order);
  }

  private async reserveInventories(
    tenantId: string,
    reservations: OrderInventoryReservation[],
  ): Promise<void> {
    for (const reservation of reservations) {
      if (!Number.isInteger(reservation.quantity) || reservation.quantity <= 0) {
        throw new ConflictException('Reservation quantity must be a positive integer.');
      }
    }

    const grouped = this.groupReservations(reservations);
    const inventoryIds = grouped.map((entry) => entry.inventoryId);
    const releaseLocks = await this.acquireInventoryLocks(tenantId, inventoryIds);

    try {
      const inventories = await this.inventoryRepository.find({
        where: inventoryIds.map((inventoryId) => ({ id: inventoryId, tenantId })),
      });
      const inventoryById = new Map(inventories.map((inventory) => [inventory.id, inventory]));

      for (const { inventoryId, quantity } of grouped) {
        const inventory = inventoryById.get(inventoryId);
        if (!inventory) {
          throw new NotFoundException(`Inventory item '${inventoryId}' not found.`);
        }

        const remaining = inventory.capacity - inventory.reservedQuantity;
        if (remaining < quantity) {
          throw new ConflictException('Not enough inventory available to reserve.');
        }
      }

      for (const { inventoryId, quantity } of grouped) {
        const inventory = inventoryById.get(inventoryId)!;
        inventory.reservedQuantity += quantity;
      }

      await this.inventoryRepository.save([...inventoryById.values()]);
    } finally {
      await releaseLocks();
    }
  }

  private async releaseInventories(
    tenantId: string,
    reservations: OrderInventoryReservation[],
  ): Promise<void> {
    const grouped = this.groupReservations(reservations);
    const inventoryIds = grouped.map((entry) => entry.inventoryId);
    const releaseLocks = await this.acquireInventoryLocks(tenantId, inventoryIds);

    try {
      const inventories = await this.inventoryRepository.find({
        where: inventoryIds.map((inventoryId) => ({ id: inventoryId, tenantId })),
      });
      const inventoryById = new Map(inventories.map((inventory) => [inventory.id, inventory]));

      for (const { inventoryId, quantity } of grouped) {
        const inventory = inventoryById.get(inventoryId);
        if (!inventory) {
          throw new NotFoundException(`Inventory item '${inventoryId}' not found.`);
        }

        inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);
      }

      await this.inventoryRepository.save([...inventoryById.values()]);
    } finally {
      await releaseLocks();
    }
  }

  private async commitInventories(
    tenantId: string,
    reservations: OrderInventoryReservation[],
  ): Promise<void> {
    const grouped = this.groupReservations(reservations);
    const inventoryIds = grouped.map((entry) => entry.inventoryId);
    const releaseLocks = await this.acquireInventoryLocks(tenantId, inventoryIds);

    try {
      const inventories = await this.inventoryRepository.find({
        where: inventoryIds.map((inventoryId) => ({ id: inventoryId, tenantId })),
      });
      const inventoryById = new Map(inventories.map((inventory) => [inventory.id, inventory]));

      for (const { inventoryId, quantity } of grouped) {
        const inventory = inventoryById.get(inventoryId);
        if (!inventory) {
          throw new NotFoundException(`Inventory item '${inventoryId}' not found.`);
        }

        if (inventory.reservedQuantity < quantity || inventory.capacity < quantity) {
          throw new ConflictException('Inventory is out of sync for commit.');
        }
      }

      for (const { inventoryId, quantity } of grouped) {
        const inventory = inventoryById.get(inventoryId)!;
        inventory.reservedQuantity -= quantity;
        inventory.capacity -= quantity;
      }

      await this.inventoryRepository.save([...inventoryById.values()]);
    } finally {
      await releaseLocks();
    }
  }

  private groupReservations(
    reservations: OrderInventoryReservation[],
  ): Array<{ inventoryId: string; quantity: number }> {
    const grouped = new Map<string, number>();

    for (const reservation of reservations) {
      grouped.set(
        reservation.inventoryId,
        (grouped.get(reservation.inventoryId) ?? 0) + reservation.quantity,
      );
    }

    return Array.from(grouped.entries())
      .map(([inventoryId, quantity]) => ({ inventoryId, quantity }))
      .sort((a, b) => a.inventoryId.localeCompare(b.inventoryId));
  }

  private async acquireInventoryLocks(
    tenantId: string,
    inventoryIds: string[],
  ): Promise<() => Promise<void>> {
    const releaseFns: Array<() => Promise<void>> = [];

    for (const inventoryId of [...new Set(inventoryIds)].sort((a, b) => a.localeCompare(b))) {
      const release = await this.redisLockService.acquireLock(`${tenantId}:${inventoryId}`, 5000);
      releaseFns.push(release);
    }

    return async () => {
      for (const release of releaseFns.reverse()) {
        await release();
      }
    };
  }

  private normalizeTotals(totals?: Partial<OrderTotals>): OrderTotals {
    return {
      subtotal: totals?.subtotal ?? 0,
      discount: totals?.discount ?? 0,
      tax: totals?.tax ?? 0,
      grandTotal:
        totals?.grandTotal ??
        (totals?.subtotal ?? 0) - (totals?.discount ?? 0) + (totals?.tax ?? 0),
    };
  }

  private normalizeAttendees(item: CreateOrderItemInput): OrderItemAttendee[] {
    const providedAttendees = item.attendees ?? [];
    if (providedAttendees.length === 0) {
      return Array.from({ length: item.quantity }, () => ({}));
    }

    return providedAttendees.slice(0, item.quantity).map((attendee) => ({
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      email: attendee.email,
      isTicketOwner: attendee.isTicketOwner,
      answers: attendee.answers,
    }));
  }
}
