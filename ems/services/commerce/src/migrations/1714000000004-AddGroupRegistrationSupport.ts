import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupRegistrationSupport1714000000004 implements MigrationInterface {
  name = 'AddGroupRegistrationSupport1714000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD COLUMN IF NOT EXISTS "attendees" jsonb NOT NULL DEFAULT '[]'::jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_fulfillments"
      ADD COLUMN IF NOT EXISTS "attendee_index" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query('DROP INDEX IF EXISTS "uq_ticket_fulfillments_order_item"');

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_ticket_fulfillments_order_item_attendee"
      ON "ticket_fulfillments" ("order_item_id", "attendee_index")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_ticket_fulfillments_order_item_attendee"');

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_ticket_fulfillments_order_item"
      ON "ticket_fulfillments" ("order_item_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_fulfillments"
      DROP COLUMN IF EXISTS "attendee_index"
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items"
      DROP COLUMN IF EXISTS "attendees"
    `);
  }
}
