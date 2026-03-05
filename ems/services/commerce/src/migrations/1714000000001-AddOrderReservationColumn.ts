import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderReservationColumn1714000000001 implements MigrationInterface {
  name = 'AddOrderReservationColumn1714000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "reservation" jsonb NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "reservation"
    `);
  }
}
