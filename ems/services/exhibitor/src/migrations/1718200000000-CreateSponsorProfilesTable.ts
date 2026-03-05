import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSponsorProfilesTable1718200000000 implements MigrationInterface {
  name = 'CreateSponsorProfilesTable1718200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sponsor_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "website_url" character varying(2048),
        "logo_url" character varying(2048),
        "sponsorship_tier" "sponsor_tier",
        "contact_info" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sponsor_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sponsor_profiles_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_sponsor_profiles_event_name" UNIQUE ("event_id", "name")
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_sponsor_profiles_tenant_id" ON "sponsor_profiles" ("tenant_id")');
    await queryRunner.query('CREATE INDEX "IDX_sponsor_profiles_event_id" ON "sponsor_profiles" ("event_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_sponsor_profiles_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_sponsor_profiles_tenant_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "sponsor_profiles"');
  }
}
