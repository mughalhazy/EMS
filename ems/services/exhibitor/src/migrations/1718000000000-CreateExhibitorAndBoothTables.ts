import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExhibitorAndBoothTables1718000000000 implements MigrationInterface {
  name = 'CreateExhibitorAndBoothTables1718000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "exhibitors" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "contact_info" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exhibitors_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_exhibitors_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_exhibitors_event_name" UNIQUE ("event_id", "name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booths" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "exhibitor_id" uuid NOT NULL,
        "venue_id" uuid NOT NULL,
        "location_code" character varying(64) NOT NULL,
        "location_label" character varying(255) NOT NULL,
        "capacity" integer NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booths_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booths_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booths_exhibitor" FOREIGN KEY ("exhibitor_id") REFERENCES "exhibitors"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booths_venue" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_booths_venue_location" UNIQUE ("venue_id", "location_code"),
        CONSTRAINT "CK_booths_capacity_non_negative" CHECK (capacity >= 0)
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_exhibitors_tenant_id" ON "exhibitors" ("tenant_id")');
    await queryRunner.query('CREATE INDEX "IDX_exhibitors_event_id" ON "exhibitors" ("event_id")');
    await queryRunner.query('CREATE INDEX "IDX_booths_tenant_id" ON "booths" ("tenant_id")');
    await queryRunner.query('CREATE INDEX "IDX_booths_event_id" ON "booths" ("event_id")');
    await queryRunner.query('CREATE INDEX "IDX_booths_exhibitor_id" ON "booths" ("exhibitor_id")');
    await queryRunner.query('CREATE INDEX "IDX_booths_venue_id" ON "booths" ("venue_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_booths_venue_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_booths_exhibitor_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_booths_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_booths_tenant_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_exhibitors_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_exhibitors_tenant_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "booths"');
    await queryRunner.query('DROP TABLE IF EXISTS "exhibitors"');
  }
}
