import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

@Entity({ schema: 'payment', name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() orderId: string;
  @Column({ type: 'integer' }) amountCents: number;
  @Column({ default: 'USD' }) currency: string;
  @Column({ default: 'manual' }) provider: string;
  @Column({ nullable: true }) providerRef?: string;
  @Column({ default: 'pending' }) status: PaymentStatus;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
