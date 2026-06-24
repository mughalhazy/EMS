import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'onsite', name: 'device_sessions' })
export class DeviceSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() eventId: string;
  @Column() deviceId: string;
  @Column({ nullable: true }) staffUserId?: string;
  @CreateDateColumn() startedAt: Date;
  @Column({ type: 'timestamptz', nullable: true }) endedAt?: Date;
}
