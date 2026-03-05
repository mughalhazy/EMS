import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventTables1713000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."events_status_enum" AS ENUM('draft', 'published', 'live', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "code" character varying(50) NOT NULL,
        "description" text,
        "timezone" character varying(100) NOT NULL,
        "start_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" "public"."events_status_enum" NOT NULL DEFAULT 'draft',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_events_id" PRIMARY KEY ("id"),
        CONSTRAINT "CK_events_date_range" CHECK ("start_at" < "end_at")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_events_tenant_code" ON "events" ("tenant_id", "code")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_events_tenant_code"');
    await queryRunner.query('DROP TABLE IF EXISTS "events"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."events_status_enum"');
  }
}
