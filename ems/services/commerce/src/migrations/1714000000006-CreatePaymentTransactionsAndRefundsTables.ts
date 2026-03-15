import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentTransactionsAndRefundsTables1714000000006 implements MigrationInterface {
  name = 'CreatePaymentTransactionsAndRefundsTables1714000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."payment_transactions_transaction_type_enum" AS ENUM('authorization', 'capture', 'void', 'refund', 'chargeback')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."payment_transactions_status_enum" AS ENUM('pending', 'succeeded', 'failed')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "payment_id" uuid NOT NULL,
        "transaction_type" "public"."payment_transactions_transaction_type_enum" NOT NULL,
        "status" "public"."payment_transactions_status_enum" NOT NULL DEFAULT 'pending',
        "amount_minor" bigint NOT NULL,
        "currency" char(3) NOT NULL DEFAULT 'USD',
        "provider_reference" character varying(128),
        "metadata" jsonb,
        "processed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_transactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_transactions_payment_id" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_payment_transactions_tenant_payment" ON "payment_transactions" ("tenant_id", "payment_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_payment_transactions_provider_reference" ON "payment_transactions" ("provider_reference")
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."refunds_status_enum" AS ENUM('pending', 'succeeded', 'failed', 'canceled')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refunds" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "payment_id" uuid NOT NULL,
        "payment_transaction_id" uuid,
        "provider_reference" character varying(128) NOT NULL,
        "status" "public"."refunds_status_enum" NOT NULL DEFAULT 'pending',
        "amount_minor" bigint NOT NULL,
        "currency" char(3) NOT NULL DEFAULT 'USD',
        "reason" character varying(256),
        "metadata" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refunds_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refunds_payment_id" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_refunds_payment_transaction_id" FOREIGN KEY ("payment_transaction_id") REFERENCES "payment_transactions"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_refunds_provider_reference" ON "refunds" ("provider_reference")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_refunds_tenant_payment" ON "refunds" ("tenant_id", "payment_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_refunds_tenant_payment"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_refunds_provider_reference"');
    await queryRunner.query('DROP TABLE IF EXISTS "refunds"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."refunds_status_enum"');

    await queryRunner.query('DROP INDEX IF EXISTS "idx_payment_transactions_provider_reference"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_payment_transactions_tenant_payment"');
    await queryRunner.query('DROP TABLE IF EXISTS "payment_transactions"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."payment_transactions_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."payment_transactions_transaction_type_enum"');
  }
}
