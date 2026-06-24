import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type FulfillmentStatus = 'pending' | 'completed' | 'failed';

@Entity({ schema: 'fulfillment', name: 'fulfillments' })
export class Fulfillment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() orderId: string;
  @Column({ default: 'pending' }) status: FulfillmentStatus;
  @Column({ type: 'timestamptz', nullable: true }) completedAt?: Date;
  @CreateDateColumn() createdAt: Date;
}
