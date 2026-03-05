import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserModuleTables1710000000000 implements MigrationInterface {
  name = 'CreateUserModuleTables1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_status_enum" AS ENUM('invited', 'active', 'disabled')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tenants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "slug" character varying(100) NOT NULL,
        CONSTRAINT "PK_tenants_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "email" character varying(320) NOT NULL,
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "status" "public"."users_status_enum" NOT NULL DEFAULT 'invited',
        "last_login_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_tenant_email" UNIQUE ("tenant_id", "email"),
        CONSTRAINT "FK_users_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
    await queryRunner.query('DROP TABLE IF EXISTS "tenants"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."users_status_enum"');
  }
}
