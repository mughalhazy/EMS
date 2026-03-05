import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TenantEntity } from '../../../tenant/src/tenant.entity';

export enum AuthSsoProviderType {
  OAUTH2 = 'oauth2',
  SAML = 'saml',
}

@Entity({ name: 'auth_sso_providers' })
@Index('uq_auth_sso_providers_tenant_slug', ['tenantId', 'slug'], { unique: true })
export class AuthSsoProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ type: 'enum', enum: AuthSsoProviderType })
  type!: AuthSsoProviderType;

  @Column({ type: 'varchar', length: 100 })
  slug!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ type: 'jsonb', name: 'configuration' })
  configuration!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
