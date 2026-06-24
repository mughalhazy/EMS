import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'notification', name: 'audience_segments' })
export class AudienceSegment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() campaignId: string;
  @Column({ type: 'jsonb' }) criteria: Record<string, unknown>;
  @CreateDateColumn() createdAt: Date;
}
