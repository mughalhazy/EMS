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

import { UserEntity } from '../../../user/src/entities/user.entity';
import { AuthSsoProviderEntity } from './auth-sso-provider.entity';

@Entity({ name: 'auth_federated_identities' })
@Index('uq_auth_federated_identity_provider_subject', ['providerId', 'subject'], {
  unique: true,
})
export class AuthFederatedIdentityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'provider_id' })
  providerId!: string;

  @ManyToOne(() => AuthSsoProviderEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider!: AuthSsoProviderEntity;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar', length: 320 })
  subject!: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'first_name', nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'last_name', nullable: true })
  lastName!: string | null;

  @Column({ type: 'timestamptz', name: 'last_authenticated_at', nullable: true })
  lastAuthenticatedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
