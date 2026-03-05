import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { InventoryEntity } from '../../ticketing/src/entities/inventory.entity';
import { CommerceEventsPublisher } from './commerce-events.publisher';
import { OrderItemEntity } from './entities/order-item.entity';
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
}

export interface CreateOrderInput {
  tenantId: string;
  status?: OrderStatus;
  totals?: Partial<OrderTotals>;
  reservation?: OrderInventoryReservation;
  items?: CreateOrderItemInput[];
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    private readonly redisLockService: RedisLockService,
    private readonly commerceEventsPublisher: CommerceEventsPublisher,
  ) {}

  async create(input: CreateOrderInput): Promise<OrderEntity> {
    if (input.reservation) {
      await this.reserveInventory(input.tenantId, input.reservation.inventoryId, input.reservation.quantity);
    }

    const order = this.orderRepository.create({
      tenantId: input.tenantId,
      status: input.status ?? OrderStatus.DRAFT,
      totals: this.normalizeTotals(input.totals),
      reservation: input.reservation ?? null,
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

    if (order.reservation) {
      if (status === OrderStatus.PLACED) {
        await this.commitInventory(tenantId, order.reservation.inventoryId, order.reservation.quantity);
        order.reservation = null;
      }

      if (status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED) {
        await this.releaseInventory(tenantId, order.reservation.inventoryId, order.reservation.quantity);
        order.reservation = null;
      }
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async findByTenant(tenantId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });
  }

  async findByTenantAndId(
    tenantId: string,
    orderId: string,
  ): Promise<OrderEntity | null> {
    return this.orderRepository.findOne({
      where: { id: orderId, tenantId },
      relations: ['items'],
    });
  }

  private async reserveInventory(tenantId: string, inventoryId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      throw new ConflictException('Reservation quantity must be greater than zero.');
    }

    await this.redisLockService.withLock(`${tenantId}:${inventoryId}`, 5000, async () => {
      const inventory = await this.inventoryRepository.findOne({ where: { id: inventoryId, tenantId } });
      if (!inventory) {
        throw new NotFoundException('Inventory item not found.');
      }

      const remaining = inventory.totalQuantity - inventory.reservedQuantity;
      if (remaining < quantity) {
        throw new ConflictException('Not enough inventory available to reserve.');
      }

      inventory.reservedQuantity += quantity;
      await this.inventoryRepository.save(inventory);
    });
  }

  private async releaseInventory(tenantId: string, inventoryId: string, quantity: number): Promise<void> {
    await this.redisLockService.withLock(`${tenantId}:${inventoryId}`, 5000, async () => {
      const inventory = await this.inventoryRepository.findOne({ where: { id: inventoryId, tenantId } });
      if (!inventory) {
        throw new NotFoundException('Inventory item not found.');
      }

      inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);
      await this.inventoryRepository.save(inventory);
    });
  }

  private async commitInventory(tenantId: string, inventoryId: string, quantity: number): Promise<void> {
    await this.redisLockService.withLock(`${tenantId}:${inventoryId}`, 5000, async () => {
      const inventory = await this.inventoryRepository.findOne({ where: { id: inventoryId, tenantId } });
      if (!inventory) {
        throw new NotFoundException('Inventory item not found.');
      }

      if (inventory.reservedQuantity < quantity || inventory.totalQuantity < quantity) {
        throw new ConflictException('Inventory is out of sync for commit.');
      }

      inventory.reservedQuantity -= quantity;
      inventory.totalQuantity -= quantity;
      await this.inventoryRepository.save(inventory);
    });
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
}
