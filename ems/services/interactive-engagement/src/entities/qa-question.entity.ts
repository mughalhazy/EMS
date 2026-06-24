import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'interactive_engagement', name: 'qa_questions' })
export class QAQuestion {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() eventId: string;
  @Column() sessionId: string;
  @Column() attendeeId: string;
  @Column({ type: 'text' }) question: string;
  @Column({ type: 'integer', default: 0 }) upvotes: number;
  @Column({ default: false }) answered: boolean;
  @CreateDateColumn() createdAt: Date;
}
