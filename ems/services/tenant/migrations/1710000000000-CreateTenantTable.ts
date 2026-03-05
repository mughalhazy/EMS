import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantTable1710000000000 implements MigrationInterface {
  name = 'CreateTenantTable1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying(150) NOT NULL,
        "name" character varying(255) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "tenants"');
  }
}
