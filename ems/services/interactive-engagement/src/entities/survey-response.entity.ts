import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'interactive_engagement', name: 'survey_responses' })
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() surveyId: string;
  @Column() attendeeId: string;
  @Column({ type: 'jsonb' }) answers: Record<string, unknown>;
  @CreateDateColumn() completedAt: Date;
}
