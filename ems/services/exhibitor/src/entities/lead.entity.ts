import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'exhibitor', name: 'leads' })
export class Lead {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() exhibitorId: string;
  @Column() attendeeId: string;
  @Column({ nullable: true }) capturedByDeviceId?: string;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @CreateDateColumn() capturedAt: Date;
}
