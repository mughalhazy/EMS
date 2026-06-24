import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'payment', name: 'refunds' })
export class Refund {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() paymentId: string;
  @Column() tenantId: string;
  @Column({ type: 'integer' }) amountCents: number;
  @Column({ type: 'text', nullable: true }) reason?: string;
  @CreateDateColumn() createdAt: Date;
}
