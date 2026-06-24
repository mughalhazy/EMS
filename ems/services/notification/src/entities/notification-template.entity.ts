import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'notification', name: 'notification_templates' })
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() name: string;
  @Column({ default: 'email' }) channel: string; // email | sms | push | in_app
  @Column({ nullable: true }) subject?: string;
  @Column({ type: 'text' }) bodyTemplate: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
