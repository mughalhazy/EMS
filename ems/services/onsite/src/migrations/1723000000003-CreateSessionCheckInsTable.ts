import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionCheckInsTable1723000000003 implements MigrationInterface {
  name = 'CreateSessionCheckInsTable1723000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "session_check_ins" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "attendee_id" uuid NOT NULL,
        "session_id" uuid NOT NULL,
        "device_id" character varying(255) NOT NULL,
        "access_granted" boolean NOT NULL,
        "denial_reason" character varying(255),
        "scanned_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "pk_session_check_ins_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_session_check_ins_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_session_check_ins_attendee_id" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_session_check_ins_session_id" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query('CREATE INDEX "idx_session_check_ins_attendee_id" ON "session_check_ins" ("attendee_id")');
    await queryRunner.query('CREATE INDEX "idx_session_check_ins_session_id" ON "session_check_ins" ("session_id")');
    await queryRunner.query('CREATE INDEX "idx_session_check_ins_event_id" ON "session_check_ins" ("event_id")');
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_session_check_ins_attendee_session" ON "session_check_ins" ("attendee_id", "session_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_session_check_ins_attendee_session"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_session_check_ins_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_session_check_ins_session_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_session_check_ins_attendee_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "session_check_ins"');
  }
}
