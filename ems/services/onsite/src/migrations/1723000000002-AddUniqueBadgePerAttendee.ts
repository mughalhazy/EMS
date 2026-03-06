import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueBadgePerAttendee1723000000002 implements MigrationInterface {
  name = 'AddUniqueBadgePerAttendee1723000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE UNIQUE INDEX "uq_badges_attendee_id" ON "badges" ("attendee_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_badges_attendee_id"');
  }
}
