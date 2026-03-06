import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSurveysTable1713000000007 implements MigrationInterface {
  name = 'CreateSurveysTable1713000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."surveys_status_enum" AS ENUM('draft', 'published', 'closed')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "surveys" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "code" character varying(64) NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "status" "public"."surveys_status_enum" NOT NULL DEFAULT 'draft',
        "is_anonymous" boolean NOT NULL DEFAULT true,
        "open_at" TIMESTAMPTZ,
        "close_at" TIMESTAMPTZ,
        "questions" jsonb,
        "settings" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_surveys_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_surveys_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "CK_surveys_open_close_window" CHECK ("open_at" IS NULL OR "close_at" IS NULL OR "open_at" < "close_at")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_surveys_tenant_event_code"
      ON "surveys" ("tenant_id", "event_id", "code")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_surveys_tenant_event_status"
      ON "surveys" ("tenant_id", "event_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_surveys_tenant_event_status"');
    await queryRunner.query('DROP INDEX IF EXISTS "uq_surveys_tenant_event_code"');
    await queryRunner.query('DROP TABLE IF EXISTS "surveys"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."surveys_status_enum"');
  }
}
