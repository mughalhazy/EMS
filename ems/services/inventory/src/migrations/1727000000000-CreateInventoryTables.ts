import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryTables1727000000000 implements MigrationInterface {
  name = 'CreateInventoryTables1727000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "inventory_reservation_status_enum" AS ENUM ('active', 'confirmed', 'released', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inventory_pools" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "capacity" integer NOT NULL DEFAULT 0,
        "reserved_quantity" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_pools_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_inventory_pools_tenant_name" UNIQUE ("tenant_id", "name"),
        CONSTRAINT "CK_inventory_pools_capacity_non_negative" CHECK (capacity >= 0),
        CONSTRAINT "CK_inventory_pools_reserved_non_negative" CHECK (reserved_quantity >= 0),
        CONSTRAINT "CK_inventory_pools_reserved_not_exceed_capacity" CHECK (reserved_quantity <= capacity)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inventory_reservations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "inventory_pool_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "status" "inventory_reservation_status_enum" NOT NULL DEFAULT 'active',
        "reference_id" character varying(255),
        "expires_at" TIMESTAMPTZ NOT NULL,
        "released_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_reservations_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventory_reservations_pool_id" FOREIGN KEY ("inventory_pool_id") REFERENCES "inventory_pools"("id") ON DELETE CASCADE,
        CONSTRAINT "CK_inventory_reservations_quantity_positive" CHECK (quantity > 0)
      )
    `);

    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_inventory_pools_tenant_id" ON "inventory_pools" ("tenant_id")');
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_inventory_reservations_tenant_id" ON "inventory_reservations" ("tenant_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_inventory_reservations_pool_id" ON "inventory_reservations" ("inventory_pool_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_inventory_reservations_status_expires_at" ON "inventory_reservations" ("status", "expires_at")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_inventory_reservations_status_expires_at"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_inventory_reservations_pool_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_inventory_reservations_tenant_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_inventory_pools_tenant_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "inventory_reservations"');
    await queryRunner.query('DROP TABLE IF EXISTS "inventory_pools"');
    await queryRunner.query('DROP TYPE IF EXISTS "inventory_reservation_status_enum"');
  }
}
