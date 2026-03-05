import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface RegistrantName {
  firstName: string;
  lastName: string;
  preferredName?: string;
}

export interface RegistrantContact {
  email: string;
  phone?: string;
}

export interface RegistrantAnswer {
  questionId: string;
  value: string | number | boolean | string[] | null;
}

@Entity({ name: 'registrant_profiles' })
@Index('idx_registrant_profiles_tenant_event', ['tenantId', 'eventId'])
@Index('uq_registrant_profiles_registration', ['registrationId'], { unique: true })
export class RegistrantProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'registration_id' })
  registrationId!: string;

  @Column({ type: 'jsonb' })
  name!: RegistrantName;

  @Column({ type: 'jsonb' })
  contact!: RegistrantContact;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  answers!: RegistrantAnswer[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
