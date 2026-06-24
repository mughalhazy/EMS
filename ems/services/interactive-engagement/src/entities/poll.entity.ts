import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'interactive_engagement', name: 'polls' })
export class Poll {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() eventId: string;
  @Column({ nullable: true }) sessionId?: string;
  @Column() question: string;
  @Column({ type: 'jsonb' }) options: string[];
  @Column({ default: true }) active: boolean;
  @CreateDateColumn() createdAt: Date;
}
