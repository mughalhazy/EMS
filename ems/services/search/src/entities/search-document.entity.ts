import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';

export type SearchEntityType = 'event' | 'session' | 'speaker' | 'exhibitor' | 'attendee';

@Entity({ schema: 'search', name: 'search_documents' })
@Unique(['tenantId', 'entityType', 'entityId'])
export class SearchDocument {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() entityType: SearchEntityType;
  @Column() entityId: string;
  @Column({ nullable: true }) eventId?: string;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) content?: string;
  @Column({ default: true }) active: boolean;
  @UpdateDateColumn() updatedAt: Date;
}
