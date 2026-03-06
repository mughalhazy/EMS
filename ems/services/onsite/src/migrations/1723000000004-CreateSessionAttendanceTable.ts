import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionAttendanceTable1723000000004 implements MigrationInterface {
  name = 'CreateSessionAttendanceTable1723000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "session_attendance" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "attendee_id" uuid NOT NULL,
        "session_id" uuid NOT NULL,
        "scanned_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "pk_session_attendance_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_session_attendance_attendee_id" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_session_attendance_session_id" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query('CREATE INDEX "idx_session_attendance_attendee_id" ON "session_attendance" ("attendee_id")');
    await queryRunner.query('CREATE INDEX "idx_session_attendance_session_id" ON "session_attendance" ("session_id")');
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_session_attendance_attendee_session" ON "session_attendance" ("attendee_id", "session_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_session_attendance_attendee_session"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_session_attendance_session_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_session_attendance_attendee_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "session_attendance"');
  }
}
