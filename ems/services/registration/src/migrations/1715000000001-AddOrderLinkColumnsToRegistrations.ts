import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderLinkColumnsToRegistrations1715000000001 implements MigrationInterface {
  name = 'AddOrderLinkColumnsToRegistrations1715000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "registrations"
      ADD COLUMN IF NOT EXISTS "order_id" uuid,
      ADD COLUMN IF NOT EXISTS "order_item_id" uuid,
      ADD COLUMN IF NOT EXISTS "attendee_index" integer
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_registrations_order_id"
      ON "registrations" ("order_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_registrations_order_item_id"
      ON "registrations" ("order_item_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_registrations_order_item_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_registrations_order_id"');

    await queryRunner.query(`
      ALTER TABLE "registrations"
      DROP COLUMN IF EXISTS "attendee_index",
      DROP COLUMN IF EXISTS "order_item_id",
      DROP COLUMN IF EXISTS "order_id"
    `);
  }
}
