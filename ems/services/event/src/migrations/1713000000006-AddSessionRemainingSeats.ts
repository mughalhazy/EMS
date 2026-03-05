import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionRemainingSeats1713000000006 implements MigrationInterface {
  name = 'AddSessionRemainingSeats1713000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "remaining_seats" integer');

    await queryRunner.query(`
      UPDATE "sessions"
      SET "remaining_seats" = "capacity"
      WHERE "capacity" IS NOT NULL
        AND "remaining_seats" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "sessions"
      ADD CONSTRAINT "CK_sessions_remaining_seats_non_negative"
      CHECK ("remaining_seats" IS NULL OR "remaining_seats" >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE "sessions"
      ADD CONSTRAINT "CK_sessions_remaining_seats_within_capacity"
      CHECK (
        ("capacity" IS NULL AND "remaining_seats" IS NULL)
        OR (
          "capacity" IS NOT NULL
          AND "remaining_seats" IS NOT NULL
          AND "remaining_seats" <= "capacity"
        )
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "CK_sessions_remaining_seats_within_capacity"',
    );
    await queryRunner.query(
      'ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "CK_sessions_remaining_seats_non_negative"',
    );
    await queryRunner.query('ALTER TABLE "sessions" DROP COLUMN IF EXISTS "remaining_seats"');
  }
}
