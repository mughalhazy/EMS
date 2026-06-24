import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'interactive_engagement', name: 'surveys' })
export class Survey {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() eventId: string;
  @Column() name: string;
  @Column({ type: 'jsonb' }) questions: Record<string, unknown>[];
  @Column({ default: true }) active: boolean;
  @CreateDateColumn() createdAt: Date;
}
