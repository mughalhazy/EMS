import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService } from '@ems/event-bus';
import { Fulfillment } from './entities/fulfillment.entity';

@Injectable()
export class FulfillmentService implements OnModuleInit {
  constructor(
    @InjectRepository(Fulfillment) private readonly fulfillments: Repository<Fulfillment>,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe('fulfillment-service', ['order.paid'], async (event) => {
      const { tenantId, payload } = event as unknown as {
        tenantId: string;
        payload: {
          orderId: string;
          userId: string;
          eventId: string;
          totalCents: number;
          items: Array<{ ticketProductId: string; quantity: number }>;
        };
      };

      const fulfillment = this.fulfillments.create({
        tenantId,
        orderId: payload.orderId,
        status: 'pending',
      });
      await this.fulfillments.save(fulfillment);

      fulfillment.status = 'completed';
      fulfillment.completedAt = new Date();
      await this.fulfillments.save(fulfillment);

      await this.eventBus.publish('fulfillment.completed', {
        eventType: 'fulfillment.completed',
        tenantId,
        payload: {
          fulfillmentId: fulfillment.id,
          orderId: payload.orderId,
          userId: payload.userId,
          eventId: payload.eventId,
          items: payload.items,
        },
      });
    });
  }

  async getFulfillment(orderId: string, tenantId: string) {
    const fulfillment = await this.fulfillments.findOne({ where: { orderId, tenantId } });
    if (!fulfillment) throw new NotFoundException('Fulfillment not found');
    return fulfillment;
  }
}
