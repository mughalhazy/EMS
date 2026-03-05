import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendeesTable1716000000000 implements MigrationInterface {
  name = 'CreateAttendeesTable1716000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."attendees_status_enum" AS ENUM ('prospect', 'registered', 'checked_in', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TABLE "attendees" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "user_id" uuid,
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "email" character varying(320) NOT NULL,
        "phone" character varying(32),
        "badge_name" character varying(120),
        "status" "public"."attendees_status_enum" NOT NULL DEFAULT 'registered',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_attendees_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_attendees_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_attendees_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "idx_attendees_tenant_id" ON "attendees" ("tenant_id")',
    );
    await queryRunner.query('CREATE INDEX "idx_attendees_event_id" ON "attendees" ("event_id")');
    await queryRunner.query('CREATE INDEX "idx_attendees_user_id" ON "attendees" ("user_id")');
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_attendees_event_email" ON "attendees" ("event_id", "email")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_attendees_event_email"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendees_user_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendees_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendees_tenant_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "attendees"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."attendees_status_enum"');
  }
}
