import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVenueAndRoomTables1713000000002 implements MigrationInterface {
  name = 'CreateVenueAndRoomTables1713000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."venues_type_enum" AS ENUM('physical', 'virtual', 'hybrid')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "venues" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "type" "public"."venues_type_enum" NOT NULL,
        "address_line1" character varying(255),
        "city" character varying(120),
        "country" character varying(2),
        "virtual_url" character varying(2048),
        "capacity" integer,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_venues_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_venues_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "CK_venues_type_requirements" CHECK (
          (
            (type = 'physical' AND address_line1 IS NOT NULL AND city IS NOT NULL AND country IS NOT NULL)
            OR (type = 'virtual' AND virtual_url IS NOT NULL)
            OR (type = 'hybrid' AND address_line1 IS NOT NULL AND city IS NOT NULL AND country IS NOT NULL AND virtual_url IS NOT NULL)
          )
        ),
        CONSTRAINT "CK_venues_capacity_non_negative" CHECK (capacity IS NULL OR capacity >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rooms" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        "venue_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "floor" character varying(50),
        "capacity" integer NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rooms_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rooms_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_rooms_venue" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE,
        CONSTRAINT "CK_rooms_capacity_non_negative" CHECK (capacity >= 0),
        CONSTRAINT "UQ_rooms_venue_name" UNIQUE ("venue_id", "name")
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_venues_tenant_event" ON "venues" ("tenant_id", "event_id")');
    await queryRunner.query('CREATE INDEX "IDX_rooms_tenant_event_venue" ON "rooms" ("tenant_id", "event_id", "venue_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_rooms_tenant_event_venue"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_venues_tenant_event"');
    await queryRunner.query('DROP TABLE IF EXISTS "rooms"');
    await queryRunner.query('DROP TABLE IF EXISTS "venues"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."venues_type_enum"');
  }
}
