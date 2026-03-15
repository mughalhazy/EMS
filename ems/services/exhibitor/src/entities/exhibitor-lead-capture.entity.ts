import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { ExhibitorEntity } from './exhibitor.entity';

@Entity({ name: 'exhibitor_lead_captures' })
@Index('idx_exhibitor_lead_captures_attendee_id', ['attendeeId'])
@Index('idx_exhibitor_lead_captures_exhibitor_id', ['exhibitorId'])
export class ExhibitorLeadCaptureEntity {
  @PrimaryColumn({ type: 'uuid', name: 'attendee_id' })
  attendeeId!: string;

  @PrimaryColumn({ type: 'uuid', name: 'exhibitor_id' })
  exhibitorId!: string;

  @ManyToOne(() => ExhibitorEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exhibitor_id' })
  exhibitor!: ExhibitorEntity;

  @PrimaryColumn({
    type: 'timestamptz',
    name: 'captured_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  capturedAt!: Date;
}
