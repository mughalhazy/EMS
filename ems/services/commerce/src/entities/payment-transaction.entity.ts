import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentTransactionType {
  AUTHORIZATION = 'authorization',
  CAPTURE = 'capture',
  VOID = 'void',
  REFUND = 'refund',
  CHARGEBACK = 'chargeback',
}

export enum PaymentTransactionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

@Entity({ name: 'payment_transactions' })
@Index('idx_payment_transactions_tenant_payment', ['tenantId', 'paymentId'])
@Index('idx_payment_transactions_provider_reference', ['providerReference'])
export class PaymentTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'payment_id' })
  paymentId!: string;

  @Column({
    type: 'enum',
    enum: PaymentTransactionType,
    name: 'transaction_type',
  })
  transactionType!: PaymentTransactionType;

  @Column({
    type: 'enum',
    enum: PaymentTransactionStatus,
    default: PaymentTransactionStatus.PENDING,
  })
  status!: PaymentTransactionStatus;

  @Column({ type: 'bigint', name: 'amount_minor' })
  amountMinor!: string;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'varchar', name: 'provider_reference', length: 128, nullable: true })
  providerReference!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', name: 'processed_at', nullable: true })
  processedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
