import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EventBusService } from '@ems/event-bus';
import { TicketProduct } from './entities/ticket-product.entity';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketProductDto } from './dto/ticketing.dto';

@Injectable()
export class TicketingService implements OnModuleInit {
  constructor(
    @InjectRepository(TicketProduct) private readonly products: Repository<TicketProduct>,
    @InjectRepository(Ticket) private readonly tickets: Repository<Ticket>,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe('ticketing-service', ['fulfillment.completed'], async (event) => {
      const { tenantId, payload } = event as unknown as {
        tenantId: string;
        payload: {
          fulfillmentId: string;
          orderId: string;
          userId: string;
          eventId: string;
          items: Array<{ ticketProductId: string; quantity: number }>;
        };
      };
      for (const item of payload.items) {
        for (let i = 0; i < item.quantity; i++) {
          const ticket = this.tickets.create({
            tenantId,
            eventId: payload.eventId,
            userId: payload.userId,
            ticketProductId: item.ticketProductId,
            orderId: payload.orderId,
            fulfillmentId: payload.fulfillmentId,
            qrCode: uuidv4(),
            status: 'issued',
          });
          await this.tickets.save(ticket);
          await this.eventBus.publish('ticket.issued', {
            eventType: 'ticket.issued',
            tenantId,
            payload: {
              ticketId: ticket.id,
              qrCode: ticket.qrCode,
              userId: payload.userId,
              eventId: payload.eventId,
            },
          });
        }
      }
    });
  }

  async createTicketProduct(tenantId: string, dto: CreateTicketProductDto) {
    const product = this.products.create({
      tenantId,
      eventId: dto.eventId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      totalCapacity: dto.totalCapacity,
      saleStartAt: dto.saleStartAt ? new Date(dto.saleStartAt) : undefined,
      saleEndAt: dto.saleEndAt ? new Date(dto.saleEndAt) : undefined,
    });
    await this.products.save(product);
    await this.eventBus.publish('ticket_product.created', {
      eventType: 'ticket_product.created',
      tenantId,
      payload: {
        ticketProductId: product.id,
        eventId: dto.eventId,
        totalCapacity: dto.totalCapacity,
      },
    });
    return product;
  }

  async listTicketProducts(tenantId: string, eventId: string) {
    return this.products.find({ where: { tenantId, eventId }, order: { createdAt: 'ASC' } });
  }

  async findTicketProduct(id: string, tenantId: string) {
    const p = await this.products.findOne({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('Ticket product not found');
    return p;
  }

  async redeemTicket(qrCode: string, tenantId: string) {
    const ticket = await this.tickets.findOne({ where: { qrCode, tenantId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.status === 'redeemed') throw new BadRequestException('Ticket already redeemed');
    if (ticket.status === 'voided') throw new BadRequestException('Ticket is voided');
    ticket.status = 'redeemed';
    ticket.redeemedAt = new Date();
    await this.tickets.save(ticket);
    await this.eventBus.publish('ticket.redeemed', {
      eventType: 'ticket.redeemed',
      tenantId,
      payload: { ticketId: ticket.id, qrCode, userId: ticket.userId, eventId: ticket.eventId },
    });
    return ticket;
  }

  async voidTicket(id: string, tenantId: string) {
    const ticket = await this.tickets.findOne({ where: { id, tenantId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.status === 'voided') throw new BadRequestException('Ticket already voided');
    ticket.status = 'voided';
    await this.tickets.save(ticket);
    await this.eventBus.publish('ticket.voided', {
      eventType: 'ticket.voided',
      tenantId,
      payload: { ticketId: id, userId: ticket.userId, eventId: ticket.eventId },
    });
    return ticket;
  }

  async listTickets(
    tenantId: string,
    filters: { userId?: string; eventId?: string },
    cursor?: string,
    limit = 20,
  ) {
    const qb = this.tickets
      .createQueryBuilder('t')
      .where('t.tenantId = :tenantId', { tenantId })
      .orderBy('t.issuedAt', 'DESC')
      .take(limit + 1);
    if (filters.userId) qb.andWhere('t.userId = :userId', { userId: filters.userId });
    if (filters.eventId) qb.andWhere('t.eventId = :eventId', { eventId: filters.eventId });
    if (cursor) qb.andWhere('t.id < :cursor', { cursor });
    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
  }
}
