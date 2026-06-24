import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CampaignStatus = 'draft' | 'scheduled' | 'sent';

@Entity({ schema: 'notification', name: 'campaigns' })
export class Campaign {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() eventId: string;
  @Column() name: string;
  @Column() subject: string;
  @Column({ type: 'text' }) body: string;
  @Column({ default: 'email' }) channel: string;
  @Column({ default: 'draft' }) status: CampaignStatus;
  @Column({ type: 'integer', nullable: true }) recipientCount?: number;
  @Column({ type: 'timestamptz', nullable: true }) scheduledAt?: Date;
  @Column({ type: 'timestamptz', nullable: true }) sentAt?: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
