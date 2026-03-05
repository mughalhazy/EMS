import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWaitlistedStatusToRegistrations1715000000000 implements MigrationInterface {
  name = 'AddWaitlistedStatusToRegistrations1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'registrations_status_enum'
        ) AND NOT EXISTS (
          SELECT 1
          FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'registrations_status_enum'
            AND e.enumlabel = 'waitlisted'
        ) THEN
          ALTER TYPE "public"."registrations_status_enum" ADD VALUE 'waitlisted';
        END IF;
      END $$;
    `);
  }

  public async down(): Promise<void> {
    // PostgreSQL does not support removing enum values safely in a reversible migration.
  }
}
