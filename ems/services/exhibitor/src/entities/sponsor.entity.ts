import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'exhibitor', name: 'sponsors' })
export class Sponsor {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() eventId: string;
  @Column({ nullable: true }) exhibitorId?: string;
  @Column() sponsorPackageId: string;
  @Column() displayName: string;
  @Column({ nullable: true }) logoUrl?: string;
  @Column({ nullable: true }) website?: string;
  @CreateDateColumn() createdAt: Date;
}
