import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'interactive_engagement', name: 'poll_responses' })
export class PollResponse {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() pollId: string;
  @Column() attendeeId: string;
  @Column() selectedOption: string;
  @CreateDateColumn() createdAt: Date;
}
