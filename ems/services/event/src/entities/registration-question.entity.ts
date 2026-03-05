import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EventEntity } from './event.entity';
import { RegistrationAnswerEntity } from './registration-answer.entity';

export enum RegistrationQuestionType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  SINGLE_SELECT = 'single_select',
  MULTI_SELECT = 'multi_select',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  DATE = 'date',
}

@Entity({ name: 'registration_questions' })
@Index('uq_registration_questions_tenant_event_code', ['tenantId', 'eventId', 'code'], {
  unique: true,
})
@Index('idx_registration_questions_tenant_event_order', ['tenantId', 'eventId', 'displayOrder'])
export class RegistrationQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, (event) => event.registrationQuestions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'id' })
  event!: EventEntity;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  label!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: RegistrationQuestionType, name: 'question_type' })
  questionType!: RegistrationQuestionType;

  @Column({ type: 'boolean', default: false, name: 'is_required' })
  isRequired!: boolean;

  @Column({ type: 'integer', default: 0, name: 'display_order' })
  displayOrder!: number;

  @Column({ type: 'jsonb', nullable: true })
  options!: Array<Record<string, unknown>> | null;

  @Column({ type: 'jsonb', nullable: true, name: 'validation_rules' })
  validationRules!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true, name: 'custom_field_config' })
  customFieldConfig!: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @OneToMany(() => RegistrationAnswerEntity, (registrationAnswer) => registrationAnswer.question)
  answers!: RegistrationAnswerEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
