import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventSettingsTable1713000000001 implements MigrationInterface {
  name = 'CreateEventSettingsTable1713000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."event_settings_visibility_enum" AS ENUM('public', 'private', 'unlisted')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "event_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "timezone" character varying(64) NOT NULL,
        "capacity" integer,
        "visibility" "public"."event_settings_visibility_enum" NOT NULL DEFAULT 'private',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_settings_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_event_settings_tenant_event" UNIQUE ("tenant_id", "event_id"),
        CONSTRAINT "FK_event_settings_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "CK_event_settings_capacity" CHECK ("capacity" IS NULL OR "capacity" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_event_settings_tenant" ON "event_settings" ("tenant_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_event_settings_tenant"');
    await queryRunner.query('DROP TABLE IF EXISTS "event_settings"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."event_settings_visibility_enum"');
  }
}
