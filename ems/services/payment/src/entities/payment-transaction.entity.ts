import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TransactionType = 'authorize' | 'capture' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

@Entity({ schema: 'payment', name: 'payment_transactions' })
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() paymentId: string;
  @Column({ default: 'capture' }) type: TransactionType;
  @Column({ type: 'integer' }) amountCents: number;
  @Column({ default: 'USD' }) currency: string;
  @Column({ default: 'pending' }) status: TransactionStatus;
  @Column({ nullable: true }) providerRef?: string;
  @CreateDateColumn() createdAt: Date;
}
