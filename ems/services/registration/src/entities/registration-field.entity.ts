import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'registration', name: 'registration_fields' })
export class RegistrationField {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() eventId: string;
  @Column() label: string;
  @Column({ default: 'text' }) fieldType: string;
  @Column({ default: false }) required: boolean;
  @Column({ default: 0 }) order: number;
  @Column({ type: 'jsonb', nullable: true }) options?: string[];
  @CreateDateColumn() createdAt: Date;
}
