import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsReportingTables1725000000000 implements MigrationInterface {
  name = 'CreateAnalyticsReportingTables1725000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "event_analytics" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "snapshot_date" date NOT NULL,
        "registrations_count" integer NOT NULL DEFAULT 0,
        "tickets_sold_count" integer NOT NULL DEFAULT 0,
        "ticket_sales_amount" numeric(14,2) NOT NULL DEFAULT 0,
        "attendees_checked_in_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_event_analytics_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_event_analytics_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "chk_event_analytics_non_negative" CHECK (
          "registrations_count" >= 0
          AND "tickets_sold_count" >= 0
          AND "ticket_sales_amount" >= 0
          AND "attendees_checked_in_count" >= 0
        )
      )
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_event_analytics_tenant_event_snapshot" ON "event_analytics" ("tenant_id", "event_id", "snapshot_date")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_event_analytics_tenant_snapshot" ON "event_analytics" ("tenant_id", "snapshot_date" DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_event_analytics_event_snapshot" ON "event_analytics" ("event_id", "snapshot_date" DESC)',
    );

    await queryRunner.query(`
      CREATE TABLE "session_analytics" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "session_id" uuid NOT NULL,
        "registered_attendees" integer NOT NULL DEFAULT 0,
        "checked_in_attendees" integer NOT NULL DEFAULT 0,
        "no_show_attendees" integer NOT NULL DEFAULT 0,
        "poll_responses" integer NOT NULL DEFAULT 0,
        "questions_asked" integer NOT NULL DEFAULT 0,
        "reactions" integer NOT NULL DEFAULT 0,
        "total_engagement_actions" integer NOT NULL DEFAULT 0,
        "engagement_score" numeric(5,2) NOT NULL DEFAULT 0,
        "last_attendance_at" TIMESTAMP WITH TIME ZONE,
        "last_engagement_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_session_analytics_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_session_analytics_session_id" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE,
        CONSTRAINT "chk_session_analytics_non_negative" CHECK (
          "registered_attendees" >= 0
          AND "checked_in_attendees" >= 0
          AND "no_show_attendees" >= 0
          AND "poll_responses" >= 0
          AND "questions_asked" >= 0
          AND "reactions" >= 0
          AND "total_engagement_actions" >= 0
        ),
        CONSTRAINT "chk_session_analytics_engagement_score_range" CHECK (
          "engagement_score" >= 0 AND "engagement_score" <= 100
        )
      )
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_session_analytics_session" ON "session_analytics" ("tenant_id", "event_id", "session_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_session_analytics_event_engagement" ON "session_analytics" ("event_id", "engagement_score" DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_session_analytics_tenant_activity" ON "session_analytics" ("tenant_id", "updated_at" DESC)',
    );

    await queryRunner.query(`
      CREATE TABLE "exhibitor_analytics" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "exhibitor_id" uuid NOT NULL,
        "booth_id" uuid NOT NULL,
        "metric_date" date NOT NULL,
        "lead_captures_count" integer NOT NULL DEFAULT 0,
        "booth_visits_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_exhibitor_analytics_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_exhibitor_analytics_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_exhibitor_analytics_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_exhibitor_analytics_exhibitor_id" FOREIGN KEY ("exhibitor_id") REFERENCES "exhibitors"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_exhibitor_analytics_booth_id" FOREIGN KEY ("booth_id") REFERENCES "booths"("id") ON DELETE CASCADE,
        CONSTRAINT "chk_exhibitor_analytics_non_negative_counts" CHECK (
          "lead_captures_count" >= 0
          AND "booth_visits_count" >= 0
        )
      )
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_exhibitor_analytics_booth_metric_date" ON "exhibitor_analytics" ("booth_id", "metric_date")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_exhibitor_analytics_tenant_event_metric_date" ON "exhibitor_analytics" ("tenant_id", "event_id", "metric_date" DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_exhibitor_analytics_exhibitor_metric_date" ON "exhibitor_analytics" ("exhibitor_id", "metric_date" DESC)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_exhibitor_analytics_exhibitor_metric_date"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_exhibitor_analytics_tenant_event_metric_date"');
    await queryRunner.query('DROP INDEX IF EXISTS "uq_exhibitor_analytics_booth_metric_date"');
    await queryRunner.query('DROP TABLE IF EXISTS "exhibitor_analytics"');

    await queryRunner.query('DROP INDEX IF EXISTS "idx_session_analytics_tenant_activity"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_session_analytics_event_engagement"');
    await queryRunner.query('DROP INDEX IF EXISTS "uq_session_analytics_session"');
    await queryRunner.query('DROP TABLE IF EXISTS "session_analytics"');

    await queryRunner.query('DROP INDEX IF EXISTS "idx_event_analytics_event_snapshot"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_event_analytics_tenant_snapshot"');
    await queryRunner.query('DROP INDEX IF EXISTS "uq_event_analytics_tenant_event_snapshot"');
    await queryRunner.query('DROP TABLE IF EXISTS "event_analytics"');
  }
}
