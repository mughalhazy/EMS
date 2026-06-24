import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'integration', name: 'webhook_subscriptions' })
export class WebhookSubscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() name: string;
  @Column() targetUrl: string;
  @Column({ type: 'jsonb' }) eventTypes: string[];
  @Column({ nullable: true }) secret?: string;
  @Column({ default: true }) active: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
