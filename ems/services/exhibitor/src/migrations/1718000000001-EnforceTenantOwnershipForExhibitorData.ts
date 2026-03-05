import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnforceTenantOwnershipForExhibitorData1718000000001 implements MigrationInterface {
  name = 'EnforceTenantOwnershipForExhibitorData1718000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "events" ADD CONSTRAINT "UQ_events_id_tenant" UNIQUE ("id", "tenant_id")',
    );
    await queryRunner.query(
      'ALTER TABLE "venues" ADD CONSTRAINT "UQ_venues_id_tenant_event" UNIQUE ("id", "tenant_id", "event_id")',
    );
    await queryRunner.query(
      'ALTER TABLE "exhibitors" ADD CONSTRAINT "UQ_exhibitors_id_tenant_event" UNIQUE ("id", "tenant_id", "event_id")',
    );

    await queryRunner.query('ALTER TABLE "exhibitors" DROP CONSTRAINT "FK_exhibitors_event"');
    await queryRunner.query(`
      ALTER TABLE "exhibitors"
      ADD CONSTRAINT "FK_exhibitors_event_tenant"
      FOREIGN KEY ("event_id", "tenant_id")
      REFERENCES "events"("id", "tenant_id")
      ON DELETE CASCADE
    `);

    await queryRunner.query('ALTER TABLE "booths" DROP CONSTRAINT "FK_booths_exhibitor"');
    await queryRunner.query('ALTER TABLE "booths" DROP CONSTRAINT "FK_booths_venue"');

    await queryRunner.query(`
      ALTER TABLE "booths"
      ADD CONSTRAINT "FK_booths_exhibitor_tenant_event"
      FOREIGN KEY ("exhibitor_id", "tenant_id", "event_id")
      REFERENCES "exhibitors"("id", "tenant_id", "event_id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "booths"
      ADD CONSTRAINT "FK_booths_venue_tenant_event"
      FOREIGN KEY ("venue_id", "tenant_id", "event_id")
      REFERENCES "venues"("id", "tenant_id", "event_id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "booths" DROP CONSTRAINT "FK_booths_venue_tenant_event"');
    await queryRunner.query('ALTER TABLE "booths" DROP CONSTRAINT "FK_booths_exhibitor_tenant_event"');

    await queryRunner.query(`
      ALTER TABLE "booths"
      ADD CONSTRAINT "FK_booths_exhibitor"
      FOREIGN KEY ("exhibitor_id")
      REFERENCES "exhibitors"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "booths"
      ADD CONSTRAINT "FK_booths_venue"
      FOREIGN KEY ("venue_id")
      REFERENCES "venues"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query('ALTER TABLE "exhibitors" DROP CONSTRAINT "FK_exhibitors_event_tenant"');
    await queryRunner.query(`
      ALTER TABLE "exhibitors"
      ADD CONSTRAINT "FK_exhibitors_event"
      FOREIGN KEY ("event_id")
      REFERENCES "events"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query('ALTER TABLE "exhibitors" DROP CONSTRAINT "UQ_exhibitors_id_tenant_event"');
    await queryRunner.query('ALTER TABLE "venues" DROP CONSTRAINT "UQ_venues_id_tenant_event"');
    await queryRunner.query('ALTER TABLE "events" DROP CONSTRAINT "UQ_events_id_tenant"');
  }
}
