import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity({ schema: 'tenant', name: 'tenant_settings' })
export class TenantSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (t) => t.settings)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
