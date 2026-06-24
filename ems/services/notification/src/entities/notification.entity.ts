import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type NotificationStatus = 'queued' | 'sent' | 'failed';

@Entity({ schema: 'notification', name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() userId: string;
  @Column({ default: 'email' }) channel: string;
  @Column({ nullable: true }) recipientAddress?: string;
  @Column({ nullable: true }) subject?: string;
  @Column({ type: 'text' }) body: string;
  @Column({ default: 'queued' }) status: NotificationStatus;
  @Column({ type: 'text', nullable: true }) errorMessage?: string;
  @Column({ type: 'timestamptz', nullable: true }) sentAt?: Date;
  @CreateDateColumn() createdAt: Date;
}
