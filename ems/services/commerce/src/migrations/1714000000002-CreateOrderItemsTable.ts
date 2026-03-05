import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderItemsTable1714000000002 implements MigrationInterface {
  name = 'CreateOrderItemsTable1714000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "inventory_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(12,2) NOT NULL,
        "total_price" numeric(12,2) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_order_items_order_id" ON "order_items" ("order_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_order_items_tenant_order" ON "order_items" ("tenant_id", "order_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_order_items_tenant_order"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_order_items_order_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "order_items"');
  }
}
