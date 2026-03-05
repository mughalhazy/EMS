import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1714000000000 implements MigrationInterface {
  name = 'CreateOrdersTable1714000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."orders_status_enum" AS ENUM('draft', 'placed', 'cancelled', 'refunded')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "status" "public"."orders_status_enum" NOT NULL DEFAULT 'draft',
        "totals" jsonb NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_orders_tenant_status" ON "orders" ("tenant_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_orders_tenant_status"');
    await queryRunner.query('DROP TABLE IF EXISTS "orders"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."orders_status_enum"');
  }
}
