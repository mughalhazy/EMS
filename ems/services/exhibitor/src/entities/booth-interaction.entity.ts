import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BoothEntity } from './booth.entity';
import { ExhibitorEntity } from './exhibitor.entity';

@Entity({ name: 'booth_interactions' })
@Index('idx_booth_interactions_tenant_id', ['tenantId'])
@Index('idx_booth_interactions_event_id', ['eventId'])
@Index('idx_booth_interactions_exhibitor_id', ['exhibitorId'])
@Index('idx_booth_interactions_booth_id', ['boothId'])
@Index('idx_booth_interactions_attendee_id', ['attendeeId'])
@Index('idx_booth_interactions_interacted_at', ['interactedAt'])
export class BoothInteractionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'exhibitor_id' })
  exhibitorId!: string;

  @ManyToOne(() => ExhibitorEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exhibitor_id' })
  exhibitor!: ExhibitorEntity;

  @Column({ type: 'uuid', name: 'booth_id' })
  boothId!: string;

  @ManyToOne(() => BoothEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booth_id' })
  booth!: BoothEntity;

  @Column({ type: 'uuid', name: 'attendee_id' })
  attendeeId!: string;

  @Column({ type: 'varchar', length: 64, name: 'interaction_type', default: 'visit' })
  interactionType!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({
    type: 'timestamptz',
    name: 'interacted_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  interactedAt!: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
