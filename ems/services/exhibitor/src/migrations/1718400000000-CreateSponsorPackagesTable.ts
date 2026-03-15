import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSponsorPackagesTable1718400000000 implements MigrationInterface {
  name = 'CreateSponsorPackagesTable1718400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sponsor_packages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "price" numeric(12,2),
        "benefits" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sponsor_packages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sponsor_packages_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_sponsor_packages_event_name" UNIQUE ("event_id", "name")
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_sponsor_packages_tenant_id" ON "sponsor_packages" ("tenant_id")');
    await queryRunner.query('CREATE INDEX "IDX_sponsor_packages_event_id" ON "sponsor_packages" ("event_id")');

    await queryRunner.query('ALTER TABLE "exhibitors" ADD COLUMN IF NOT EXISTS "sponsor_package_id" uuid');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_exhibitors_sponsor_package_id" ON "exhibitors" ("sponsor_package_id")');
    await queryRunner.query(`
      ALTER TABLE "exhibitors"
      ADD CONSTRAINT "FK_exhibitors_sponsor_package"
      FOREIGN KEY ("sponsor_package_id") REFERENCES "sponsor_packages"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "exhibitors" DROP CONSTRAINT IF EXISTS "FK_exhibitors_sponsor_package"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_exhibitors_sponsor_package_id"');
    await queryRunner.query('ALTER TABLE "exhibitors" DROP COLUMN IF EXISTS "sponsor_package_id"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_sponsor_packages_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_sponsor_packages_tenant_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "sponsor_packages"');
  }
}
