import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1713000000000 implements MigrationInterface {
  name = 'CreateEventsTable1713000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."events_status_enum" AS ENUM('draft', 'published', 'live', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "code" character varying(64) NOT NULL,
        "description" text,
        "timezone" character varying(64) NOT NULL,
        "start_at" TIMESTAMPTZ NOT NULL,
        "end_at" TIMESTAMPTZ NOT NULL,
        "status" "public"."events_status_enum" NOT NULL DEFAULT 'draft',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_events_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_events_tenant_code" UNIQUE ("tenant_id", "code"),
        CONSTRAINT "CK_events_time_window" CHECK ("start_at" < "end_at")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_events_tenant_status_start"
      ON "events" ("tenant_id", "status", "start_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_events_tenant_status_start"');
    await queryRunner.query('DROP TABLE IF EXISTS "events"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."events_status_enum"');
  }
}
