import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'auth', name: 'sso_connections' })
@Unique(['tenantId', 'domain'])
export class SsoConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['oauth2', 'saml'] })
  provider: 'oauth2' | 'saml';

  @Column()
  domain: string;

  @Column()
  issuer: string;

  @Column({ nullable: true })
  clientId?: string;

  @Column({ nullable: true })
  clientSecret?: string;

  @Column({ nullable: true })
  ssoUrl?: string;

  @Column({ type: 'text', nullable: true })
  certificate?: string;

  @Column({ type: 'jsonb', default: {} })
  attributeMapping: Record<string, string>;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
