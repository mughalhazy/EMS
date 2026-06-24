import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'ai_service', name: 'ai_interaction_logs' })
export class AIInteractionLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ nullable: true }) userId?: string;
  @Column({ type: 'text' }) prompt: string;
  @Column({ type: 'text', nullable: true }) response?: string;
  @Column({ type: 'jsonb', nullable: true }) context?: Record<string, unknown>;
  @CreateDateColumn() createdAt: Date;
}
