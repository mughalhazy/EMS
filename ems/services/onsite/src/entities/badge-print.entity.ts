import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'onsite', name: 'badge_prints' })
export class BadgePrint {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() eventId: string;
  @Column() attendeeId: string;
  @Column({ default: 1 }) copies: number;
  @Column({ nullable: true }) deviceId?: string;
  @CreateDateColumn() printedAt: Date;
}
