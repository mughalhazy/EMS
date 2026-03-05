import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
}

@Entity({ name: 'payments' })
@Index('idx_payments_provider_reference', ['providerReference'], { unique: true })
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  provider!: string;

  @Column({ type: 'varchar', name: 'provider_reference', length: 128 })
  providerReference!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ type: 'bigint', name: 'amount_minor' })
  amountMinor!: string;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
