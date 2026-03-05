import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExhibitorLeadCapturesTable1718100000000 implements MigrationInterface {
  name = 'CreateExhibitorLeadCapturesTable1718100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "exhibitor_lead_captures" (
        "attendee_id" uuid NOT NULL,
        "exhibitor_id" uuid NOT NULL,
        "captured_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exhibitor_lead_captures" PRIMARY KEY ("attendee_id", "exhibitor_id", "captured_at"),
        CONSTRAINT "FK_exhibitor_lead_captures_attendee" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_exhibitor_lead_captures_exhibitor" FOREIGN KEY ("exhibitor_id") REFERENCES "exhibitors"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_exhibitor_lead_captures_attendee_id" ON "exhibitor_lead_captures" ("attendee_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_exhibitor_lead_captures_exhibitor_id" ON "exhibitor_lead_captures" ("exhibitor_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_exhibitor_lead_captures_exhibitor_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_exhibitor_lead_captures_attendee_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "exhibitor_lead_captures"');
  }
}
