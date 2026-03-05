import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionsSpeakersTables1713000000005 implements MigrationInterface {
  name = 'CreateSessionsSpeakersTables1713000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."sessions_session_type_enum" AS ENUM('keynote', 'talk', 'panel', 'workshop', 'networking', 'other')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."sessions_status_enum" AS ENUM('draft', 'scheduled', 'completed', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."speakers_status_enum" AS ENUM('invited', 'confirmed', 'declined', 'withdrawn')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "room_id" uuid,
        "title" character varying(255) NOT NULL,
        "abstract" text,
        "session_type" "public"."sessions_session_type_enum" NOT NULL,
        "start_at" TIMESTAMPTZ NOT NULL,
        "end_at" TIMESTAMPTZ NOT NULL,
        "capacity" integer,
        "status" "public"."sessions_status_enum" NOT NULL DEFAULT 'draft',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sessions_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sessions_room_id" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL,
        CONSTRAINT "CK_sessions_time_window" CHECK ("start_at" < "end_at"),
        CONSTRAINT "CK_sessions_capacity_non_negative" CHECK ("capacity" IS NULL OR "capacity" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "speakers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "organization_id" uuid,
        "first_name" character varying(120) NOT NULL,
        "last_name" character varying(120) NOT NULL,
        "email" character varying(320),
        "bio" text,
        "status" "public"."speakers_status_enum" NOT NULL DEFAULT 'invited',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_speakers_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_speakers_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "session_speakers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "session_id" uuid NOT NULL,
        "speaker_id" uuid NOT NULL,
        "is_primary" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_session_speakers_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_session_speakers_session_id" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_session_speakers_speaker_id" FOREIGN KEY ("speaker_id") REFERENCES "speakers"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_session_speakers_session_speaker" UNIQUE ("session_id", "speaker_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_sessions_event_start_at"
      ON "sessions" ("event_id", "start_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_speakers_event_status"
      ON "speakers" ("event_id", "status")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_speakers_event_email"
      ON "speakers" ("event_id", "email")
      WHERE "email" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_session_speakers_speaker"
      ON "session_speakers" ("speaker_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_session_speakers_speaker"');
    await queryRunner.query('DROP INDEX IF EXISTS "uq_speakers_event_email"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_speakers_event_status"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_sessions_event_start_at"');

    await queryRunner.query('DROP TABLE IF EXISTS "session_speakers"');
    await queryRunner.query('DROP TABLE IF EXISTS "speakers"');
    await queryRunner.query('DROP TABLE IF EXISTS "sessions"');

    await queryRunner.query('DROP TYPE IF EXISTS "public"."speakers_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."sessions_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."sessions_session_type_enum"');
  }
}
