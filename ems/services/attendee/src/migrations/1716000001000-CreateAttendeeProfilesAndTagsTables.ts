import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendeeProfilesAndTagsTables1716000001000 implements MigrationInterface {
  name = 'CreateAttendeeProfilesAndTagsTables1716000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "attendee_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "bio" text,
        "interests" text[] NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_attendee_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_attendee_profiles_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_attendee_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "idx_attendee_profiles_tenant_id" ON "attendee_profiles" ("tenant_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_attendee_profiles_event_id" ON "attendee_profiles" ("event_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_attendee_profiles_user_id" ON "attendee_profiles" ("user_id")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_attendee_profiles_event_user" ON "attendee_profiles" ("event_id", "user_id")',
    );

    await queryRunner.query(`
      CREATE TABLE "attendee_tags" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "attendee_id" uuid NOT NULL,
        "tag" character varying(64) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_attendee_tags_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_attendee_tags_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_attendee_tags_attendee_id" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query('CREATE INDEX "idx_attendee_tags_tenant_id" ON "attendee_tags" ("tenant_id")');
    await queryRunner.query('CREATE INDEX "idx_attendee_tags_event_id" ON "attendee_tags" ("event_id")');
    await queryRunner.query(
      'CREATE INDEX "idx_attendee_tags_attendee_id" ON "attendee_tags" ("attendee_id")',
    );
    await queryRunner.query('CREATE INDEX "idx_attendee_tags_tag" ON "attendee_tags" ("tag")');
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_attendee_tags_event_attendee_tag" ON "attendee_tags" ("event_id", "attendee_id", "tag")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_attendee_tags_event_attendee_tag"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_tags_tag"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_tags_attendee_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_tags_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_tags_tenant_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "attendee_tags"');

    await queryRunner.query('DROP INDEX IF EXISTS "uq_attendee_profiles_event_user"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_profiles_user_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_profiles_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_attendee_profiles_tenant_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "attendee_profiles"');
  }
}
