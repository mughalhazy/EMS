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

import { EventEntity } from '../../../event/src/entities/event.entity';
import { TicketEntity } from '../../../ticketing/src/entities/ticket.entity';
import { UserEntity } from '../../../user/src/entities/user.entity';
import { RegistrationStatus } from './registration-status.entity';

@Entity({ name: 'registrations' })
@Index('idx_registrations_tenant_id', ['tenantId'])
@Index('idx_registrations_event_id', ['eventId'])
@Index('idx_registrations_user_id', ['userId'])
@Index('idx_registrations_ticket_id', ['ticketId'])
@Index('idx_registrations_order_id', ['orderId'])
@Index('idx_registrations_order_item_id', ['orderItemId'])
@Index('idx_registrations_status', ['status'])
@Index('uq_registrations_tenant_event_user_ticket', ['tenantId', 'eventId', 'userId', 'ticketId'], {
  unique: true,
})
export class RegistrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'uuid', name: 'ticket_id' })
  ticketId!: string;

  @Column({ type: 'uuid', name: 'order_id', nullable: true })
  orderId!: string | null;

  @Column({ type: 'uuid', name: 'order_item_id', nullable: true })
  orderItemId!: string | null;

  @Column({ type: 'int', name: 'attendee_index', nullable: true })
  attendeeIndex!: number | null;

  @ManyToOne(() => TicketEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketEntity;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status!: RegistrationStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
