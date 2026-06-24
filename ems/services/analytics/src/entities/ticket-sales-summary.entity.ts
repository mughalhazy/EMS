import { Column, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'analytics', name: 'ticket_sales_summaries' })
@Unique(['tenantId', 'eventId', 'ticketProductId'])
export class TicketSalesSummary {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() eventId: string;
  @Column() ticketProductId: string;
  @Column({ type: 'int', default: 0 }) quantitySold: number;
  @Column({ type: 'int', default: 0 }) ordersCount: number;
  @UpdateDateColumn() updatedAt: Date;
}
