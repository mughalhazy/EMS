import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TicketEntity } from './ticket.entity';

export enum TicketEntitlementStatus {
  ACTIVE = 'active',
  CONSUMED = 'consumed',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

@Entity({ name: 'ticket_entitlements' })
@Index('idx_ticket_entitlements_tenant_id', ['tenantId'])
@Index('idx_ticket_entitlements_ticket_id', ['ticketId'])
@Index('idx_ticket_entitlements_status', ['status'])
export class TicketEntitlementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'ticket_id' })
  ticketId!: string;

  @ManyToOne(() => TicketEntity, (ticket) => ticket.entitlements, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketEntity;

  @Column({ type: 'varchar', length: 120, name: 'entitlement_type' })
  entitlementType!: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  payload!: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: TicketEntitlementStatus,
    default: TicketEntitlementStatus.ACTIVE,
  })
  status!: TicketEntitlementStatus;

  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'consumed_at', nullable: true })
  consumedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
