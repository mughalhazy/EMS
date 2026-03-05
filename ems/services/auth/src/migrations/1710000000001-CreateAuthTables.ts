import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthTables1710000000001 implements MigrationInterface {
  name = 'CreateAuthTables1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."roles_scope_enum" AS ENUM('tenant', 'organization', 'event')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(64) NOT NULL,
        "scope" "public"."roles_scope_enum" NOT NULL DEFAULT 'tenant',
        "description" text,
        "is_system" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_tenant_name" UNIQUE ("tenant_id", "name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "resource" character varying(64) NOT NULL,
        "action" character varying(64) NOT NULL,
        "code" character varying(128) NOT NULL,
        "description" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permissions_resource_action" UNIQUE ("resource", "action"),
        CONSTRAINT "UQ_permissions_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permissions_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission_id" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_role_assignments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        "scope_type" character varying(32),
        "scope_id" uuid,
        "assigned_by" uuid,
        "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "expires_at" TIMESTAMPTZ,
        "revoked_at" TIMESTAMPTZ,
        CONSTRAINT "PK_user_role_assignments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_role_assignments_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "CK_user_role_assignments_scope_pair" CHECK ((scope_type IS NULL AND scope_id IS NULL) OR (scope_type IS NOT NULL AND scope_id IS NOT NULL)),
        CONSTRAINT "CK_user_role_assignments_scope_type" CHECK (scope_type IS NULL OR scope_type IN ('tenant', 'organization', 'event')),
        CONSTRAINT "UQ_user_role_assignments_active" UNIQUE ("tenant_id", "user_id", "role_id", "scope_type", "scope_id", "revoked_at")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "token_hash" character varying(255) NOT NULL,
        "user_agent" character varying(255),
        "ip" inet,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "revoked_at" TIMESTAMPTZ,
        "replaced_by" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_refresh_tokens_hash" UNIQUE ("token_hash")
      )
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_user_role_assignments_lookup" ON "user_role_assignments" ("tenant_id", "user_id", "scope_type", "scope_id") WHERE "revoked_at" IS NULL',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_role_permissions_permission" ON "role_permissions" ("permission_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_user_tenant" ON "refresh_tokens" ("user_id", "tenant_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "refresh_tokens"');
    await queryRunner.query('DROP TABLE IF EXISTS "user_role_assignments"');
    await queryRunner.query('DROP TABLE IF EXISTS "role_permissions"');
    await queryRunner.query('DROP TABLE IF EXISTS "permissions"');
    await queryRunner.query('DROP TABLE IF EXISTS "roles"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."roles_scope_enum"');
  }
}
