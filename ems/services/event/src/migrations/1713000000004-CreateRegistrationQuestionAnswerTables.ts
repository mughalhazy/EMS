import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegistrationQuestionAnswerTables1713000000004 implements MigrationInterface {
  name = 'CreateRegistrationQuestionAnswerTables1713000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."registration_questions_question_type_enum" AS ENUM(
        'short_text',
        'long_text',
        'single_select',
        'multi_select',
        'boolean',
        'number',
        'date'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "registration_questions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "code" character varying(64) NOT NULL,
        "label" character varying(255) NOT NULL,
        "description" text,
        "question_type" "public"."registration_questions_question_type_enum" NOT NULL,
        "is_required" boolean NOT NULL DEFAULT false,
        "display_order" integer NOT NULL DEFAULT 0,
        "options" jsonb,
        "validation_rules" jsonb,
        "custom_field_config" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_registration_questions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_registration_questions_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_registration_questions_tenant_event_code" UNIQUE ("tenant_id", "event_id", "code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_registration_questions_tenant_event_order"
      ON "registration_questions" ("tenant_id", "event_id", "display_order")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "registration_answers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "registration_id" uuid NOT NULL,
        "question_id" uuid NOT NULL,
        "answer_text" text,
        "answer_json" jsonb,
        "custom_field_key" character varying(255),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_registration_answers_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_registration_answers_question_id" FOREIGN KEY ("question_id") REFERENCES "registration_questions"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_registration_answers_tenant_registration_question" UNIQUE ("tenant_id", "registration_id", "question_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_registration_answers_tenant_registration"
      ON "registration_answers" ("tenant_id", "registration_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_registration_answers_tenant_registration"');
    await queryRunner.query('DROP TABLE IF EXISTS "registration_answers"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_registration_questions_tenant_event_order"');
    await queryRunner.query('DROP TABLE IF EXISTS "registration_questions"');

    await queryRunner.query('DROP TYPE IF EXISTS "public"."registration_questions_question_type_enum"');
  }
}
