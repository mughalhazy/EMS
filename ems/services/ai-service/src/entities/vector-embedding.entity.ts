import { Column, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'ai_service', name: 'vector_embeddings' })
@Unique(['entityType', 'entityId'])
export class VectorEmbedding {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() entityType: string;
  @Column() entityId: string;
  @Column({ type: 'jsonb' }) vector: number[];
  @Column({ default: 'placeholder-v0' }) modelVersion: string;
  @UpdateDateColumn() updatedAt: Date;
}
