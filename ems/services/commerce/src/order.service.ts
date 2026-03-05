import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { OrderEntity, OrderStatus, OrderTotals } from './entities/order.entity';

export interface CreateOrderInput {
  tenantId: string;
  status?: OrderStatus;
  totals?: Partial<OrderTotals>;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async create(input: CreateOrderInput): Promise<OrderEntity> {
    const order = this.orderRepository.create({
      tenantId: input.tenantId,
      status: input.status ?? OrderStatus.DRAFT,
      totals: this.normalizeTotals(input.totals),
    });

    return this.orderRepository.save(order);
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
    return this.update(tenantId, orderId, { status });
  }

  async findByTenant(tenantId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenantAndId(
    tenantId: string,
    orderId: string,
  ): Promise<OrderEntity | null> {
    return this.orderRepository.findOne({
      where: { id: orderId, tenantId },
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
