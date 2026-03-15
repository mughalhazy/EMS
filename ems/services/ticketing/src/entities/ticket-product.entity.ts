import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EventEntity } from '../../../event/src/entities/event.entity';
import { TicketEntity } from './ticket.entity';

export enum TicketProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity({ name: 'ticket_products' })
@Index('idx_ticket_products_tenant_id', ['tenantId'])
@Index('idx_ticket_products_event_id', ['eventId'])
@Index('uq_ticket_products_tenant_event_name', ['tenantId', 'eventId', 'name'], { unique: true })
export class TicketProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'timestamptz', name: 'sales_start_at', nullable: true })
  salesStartAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'sales_end_at', nullable: true })
  salesEndAt!: Date | null;

  @Column({
    type: 'enum',
    enum: TicketProductStatus,
    default: TicketProductStatus.DRAFT,
  })
  status!: TicketProductStatus;

  @OneToMany(() => TicketEntity, (ticket) => ticket.ticketProduct)
  tickets!: TicketEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
