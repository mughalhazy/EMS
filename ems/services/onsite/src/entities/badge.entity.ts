import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AttendeeEntity } from '../../../attendee/src/entities/attendee.entity';

@Entity({ name: 'badges' })
@Index('idx_badges_attendee_id', ['attendeeId'])
@Index('uq_badges_badge_id', ['badgeId'], { unique: true })
export class BadgeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'attendee_id' })
  attendeeId!: string;

  @OneToOne(() => AttendeeEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendee_id' })
  attendee!: AttendeeEntity;

  @Column({ type: 'varchar', length: 100, name: 'badge_id' })
  badgeId!: string;

  @Column({ type: 'text', name: 'qr_code' })
  qrCode!: string;

  @Column({ type: 'timestamptz', name: 'printed_at', nullable: true })
  printedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
