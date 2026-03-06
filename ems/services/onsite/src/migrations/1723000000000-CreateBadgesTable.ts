import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBadgesTable1723000000000 implements MigrationInterface {
  name = 'CreateBadgesTable1723000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "badges" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "attendee_id" uuid NOT NULL,
        "badge_id" character varying(100) NOT NULL,
        "qr_code" text NOT NULL,
        "printed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_badges_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_badges_attendee_id" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query('CREATE INDEX "idx_badges_attendee_id" ON "badges" ("attendee_id")');
    await queryRunner.query('CREATE UNIQUE INDEX "uq_badges_badge_id" ON "badges" ("badge_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_badges_badge_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_badges_attendee_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "badges"');
  }
}
