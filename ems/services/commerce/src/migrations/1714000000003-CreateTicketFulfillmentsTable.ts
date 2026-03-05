import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketFulfillmentsTable1714000000003 implements MigrationInterface {
  name = 'CreateTicketFulfillmentsTable1714000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."ticket_fulfillments_status_enum" AS ENUM('pending', 'generated', 'attached', 'revoked', 'failed')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ticket_fulfillments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "order_item_id" uuid NOT NULL,
        "qr_code" character varying(64) NOT NULL,
        "status" "public"."ticket_fulfillments_status_enum" NOT NULL DEFAULT 'pending',
        "metadata" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_fulfillments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ticket_fulfillments_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_fulfillments_order_item_id" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ticket_fulfillments_tenant_order" ON "ticket_fulfillments" ("tenant_id", "order_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_ticket_fulfillments_order_item" ON "ticket_fulfillments" ("order_item_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_ticket_fulfillments_order_item"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_ticket_fulfillments_tenant_order"');
    await queryRunner.query('DROP TABLE IF EXISTS "ticket_fulfillments"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."ticket_fulfillments_status_enum"');
  }
}
