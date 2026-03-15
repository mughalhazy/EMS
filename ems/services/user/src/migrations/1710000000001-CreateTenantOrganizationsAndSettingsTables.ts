import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantOrganizationsAndSettingsTables1710000000001
  implements MigrationInterface
{
  name = 'CreateTenantOrganizationsAndSettingsTables1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenants"
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "organizations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "slug" character varying(100) NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organizations_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_organizations_tenant_slug" UNIQUE ("tenant_id", "slug"),
        CONSTRAINT "FK_organizations_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tenant_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "timezone" character varying(100) NOT NULL DEFAULT 'UTC',
        "locale" character varying(10) NOT NULL DEFAULT 'en-US',
        "config" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_settings_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_settings_tenant_id" UNIQUE ("tenant_id"),
        CONSTRAINT "FK_tenant_settings_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "tenant_settings"');
    await queryRunner.query('DROP TABLE IF EXISTS "organizations"');
    await queryRunner.query(
      'ALTER TABLE "tenants" DROP COLUMN IF EXISTS "updated_at", DROP COLUMN IF EXISTS "created_at"',
    );
  }
}
