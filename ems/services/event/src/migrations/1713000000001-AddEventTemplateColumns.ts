import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventTemplateColumns1713000000001 implements MigrationInterface {
  name = 'AddEventTemplateColumns1713000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "events"
      ADD COLUMN IF NOT EXISTS "agenda" jsonb,
      ADD COLUMN IF NOT EXISTS "settings" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "events"
      DROP COLUMN IF EXISTS "settings",
      DROP COLUMN IF EXISTS "agenda"
    `);
  }
}
