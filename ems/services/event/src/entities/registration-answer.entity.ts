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

import { RegistrationQuestionEntity } from './registration-question.entity';

@Entity({ name: 'registration_answers' })
@Index('idx_registration_answers_tenant_registration', ['tenantId', 'registrationId'])
@Index('uq_registration_answers_tenant_registration_question', ['tenantId', 'registrationId', 'questionId'], {
  unique: true,
})
export class RegistrationAnswerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'registration_id' })
  registrationId!: string;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId!: string;

  @ManyToOne(() => RegistrationQuestionEntity, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id', referencedColumnName: 'id' })
  question!: RegistrationQuestionEntity;

  @Column({ type: 'text', nullable: true, name: 'answer_text' })
  answerText!: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'answer_json' })
  answerJson!: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'custom_field_key' })
  customFieldKey!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
