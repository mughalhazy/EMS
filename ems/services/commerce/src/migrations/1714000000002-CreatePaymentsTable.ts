import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1714000000002 implements MigrationInterface {
  name = 'CreatePaymentsTable1714000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'authorized', 'succeeded', 'failed', 'refunded', 'canceled')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "provider" character varying(64) NOT NULL,
        "provider_reference" character varying(128) NOT NULL,
        "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending',
        "amount_minor" bigint NOT NULL,
        "currency" char(3) NOT NULL DEFAULT 'USD',
        "metadata" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_payments_provider_reference" ON "payments" ("provider_reference")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_payments_tenant_order" ON "payments" ("tenant_id", "order_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_payments_tenant_order"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_payments_provider_reference"');
    await queryRunner.query('DROP TABLE IF EXISTS "payments"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."payments_status_enum"');
  }
}
