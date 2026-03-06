import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendeeConnectionsTable1719000000000
  implements MigrationInterface
{
  name = 'CreateAttendeeConnectionsTable1719000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."attendee_connections_status_enum" AS ENUM ('pending', 'accepted', 'declined', 'blocked')
    `);

    await queryRunner.query(`
      CREATE TABLE "attendee_connections" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "attendee_a_id" uuid NOT NULL,
        "attendee_b_id" uuid NOT NULL,
        "status" "public"."attendee_connections_status_enum" NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_attendee_connections_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_attendee_connections_attendee_a_id" FOREIGN KEY ("attendee_a_id") REFERENCES "attendees"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_attendee_connections_attendee_b_id" FOREIGN KEY ("attendee_b_id") REFERENCES "attendees"("id") ON DELETE CASCADE,
        CONSTRAINT "chk_attendee_connections_not_self" CHECK ("attendee_a_id" <> "attendee_b_id")
      )
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_attendee_connections_tenant_event_pair" ON "attendee_connections" ("tenant_id", "event_id", "attendee_a_id", "attendee_b_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_attendee_connections_tenant_event" ON "attendee_connections" ("tenant_id", "event_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_attendee_connections_attendee_a" ON "attendee_connections" ("attendee_a_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_attendee_connections_attendee_b" ON "attendee_connections" ("attendee_b_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_connections_attendee_b"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_connections_attendee_a"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_connections_tenant_event"');
    await queryRunner.query('DROP INDEX IF EXISTS "uq_attendee_connections_tenant_event_pair"');
    await queryRunner.query('DROP TABLE IF EXISTS "attendee_connections"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."attendee_connections_status_enum"');
  }
}
