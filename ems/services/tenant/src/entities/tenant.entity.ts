import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { TenantSettings } from './tenant-settings.entity';

@Entity({ schema: 'tenant', name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 'starter' })
  plan: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Organization, (o) => o.tenant)
  organizations: Organization[];

  @OneToMany(() => TenantSettings, (s) => s.tenant)
  settings: TenantSettings[];
}
