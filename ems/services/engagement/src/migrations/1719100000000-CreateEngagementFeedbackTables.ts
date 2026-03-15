import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEngagementFeedbackTables1719100000000 implements MigrationInterface {
  name = 'CreateEngagementFeedbackTables1719100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."engagement_surveys_status_enum" AS ENUM ('draft', 'published', 'closed')
    `);

    await queryRunner.query(`
      CREATE TABLE "engagement_surveys" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "code" character varying(64) NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "status" "public"."engagement_surveys_status_enum" NOT NULL DEFAULT 'draft',
        "is_anonymous" boolean NOT NULL DEFAULT true,
        "open_at" TIMESTAMP WITH TIME ZONE,
        "close_at" TIMESTAMP WITH TIME ZONE,
        "questions" jsonb,
        "settings" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_engagement_surveys_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_engagement_surveys_tenant_event_code" ON "engagement_surveys" ("tenant_id", "event_id", "code")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_engagement_surveys_tenant_event_status" ON "engagement_surveys" ("tenant_id", "event_id", "status")',
    );

    await queryRunner.query(`
      CREATE TABLE "engagement_questions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "question" text NOT NULL,
        "attendee_id" uuid NOT NULL,
        "session_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_engagement_questions_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "idx_engagement_questions_tenant_event" ON "engagement_questions" ("tenant_id", "event_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_engagement_questions_session_id" ON "engagement_questions" ("session_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_engagement_questions_attendee_id" ON "engagement_questions" ("attendee_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_engagement_questions_attendee_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_engagement_questions_session_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_engagement_questions_tenant_event"');
    await queryRunner.query('DROP TABLE IF EXISTS "engagement_questions"');

    await queryRunner.query('DROP INDEX IF EXISTS "idx_engagement_surveys_tenant_event_status"');
    await queryRunner.query('DROP INDEX IF EXISTS "uq_engagement_surveys_tenant_event_code"');
    await queryRunner.query('DROP TABLE IF EXISTS "engagement_surveys"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."engagement_surveys_status_enum"');
  }
}
