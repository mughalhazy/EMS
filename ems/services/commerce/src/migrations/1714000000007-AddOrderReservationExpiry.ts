import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderReservationExpiry1714000000007 implements MigrationInterface {
  name = 'AddOrderReservationExpiry1714000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "reservation_expires_at" timestamptz NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "reservation_expires_at"
    `);
  }
}
