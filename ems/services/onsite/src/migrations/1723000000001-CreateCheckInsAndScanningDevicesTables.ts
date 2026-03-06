import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCheckInsAndScanningDevicesTables1723000000001 implements MigrationInterface {
  name = 'CreateCheckInsAndScanningDevicesTables1723000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "scanning_devices" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "device_id" character varying(255) NOT NULL,
        "event_id" uuid NOT NULL,
        "status" character varying(100) NOT NULL,
        CONSTRAINT "pk_scanning_devices_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query('CREATE INDEX "idx_scanning_devices_event_id" ON "scanning_devices" ("event_id")');
    await queryRunner.query('CREATE UNIQUE INDEX "uq_scanning_devices_device_id" ON "scanning_devices" ("device_id")');

    await queryRunner.query(`
      CREATE TABLE "check_ins" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "attendee_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "checked_in_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "device_id" character varying(255) NOT NULL,
        CONSTRAINT "pk_check_ins_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_check_ins_attendee_id" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_check_ins_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query('CREATE INDEX "idx_check_ins_attendee_id" ON "check_ins" ("attendee_id")');
    await queryRunner.query('CREATE INDEX "idx_check_ins_event_id" ON "check_ins" ("event_id")');
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_check_ins_attendee_event" ON "check_ins" ("attendee_id", "event_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_check_ins_attendee_event"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_check_ins_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_check_ins_attendee_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "check_ins"');

    await queryRunner.query('DROP INDEX IF EXISTS "uq_scanning_devices_device_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_scanning_devices_event_id"');
    await queryRunner.query('DROP TABLE IF EXISTS "scanning_devices"');
  }
}
