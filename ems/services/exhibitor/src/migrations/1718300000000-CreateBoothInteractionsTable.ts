import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBoothInteractionsTable1718300000000 implements MigrationInterface {
  name = 'CreateBoothInteractionsTable1718300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booth_interactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "exhibitor_id" uuid NOT NULL,
        "booth_id" uuid NOT NULL,
        "attendee_id" uuid NOT NULL,
        "interaction_type" character varying(64) NOT NULL DEFAULT 'visit',
        "metadata" jsonb,
        "interacted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booth_interactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booth_interactions_exhibitor" FOREIGN KEY ("exhibitor_id") REFERENCES "exhibitors"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booth_interactions_booth" FOREIGN KEY ("booth_id") REFERENCES "booths"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booth_interactions_attendee" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_booth_interactions_tenant_id" ON "booth_interactions" ("tenant_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_booth_interactions_event_id" ON "booth_interactions" ("event_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_booth_interactions_exhibitor_id" ON "booth_interactions" ("exhibitor_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_booth_interactions_booth_id" ON "booth_interactions" ("booth_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_booth_interactions_attendee_id" ON "booth_interactions" ("attendee_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_booth_interactions_interacted_at" ON "booth_interactions" ("interacted_at")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_booth_interactions_interacted_at"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_booth_interactions_attendee_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_booth_interactions_booth_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_booth_interactions_exhibitor_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_booth_interactions_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_booth_interactions_tenant_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "booth_interactions"');
  }
}
