import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationMessagesTable1719000000000 implements MigrationInterface {
  name = 'CreateNotificationMessagesTable1719000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."notification_messages_channel_enum" AS ENUM ('email', 'sms', 'push')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."notification_messages_status_enum" AS ENUM ('pending', 'sent', 'failed')
    `);

    await queryRunner.query(`
      CREATE TABLE "notification_messages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "event_id" uuid,
        "channel" "public"."notification_messages_channel_enum" NOT NULL,
        "recipient_address" character varying(320) NOT NULL,
        "subject" character varying(255),
        "body" text NOT NULL,
        "status" "public"."notification_messages_status_enum" NOT NULL DEFAULT 'pending',
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "failure_reason" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_notification_messages_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "idx_notification_messages_tenant_id" ON "notification_messages" ("tenant_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_notification_messages_event_id" ON "notification_messages" ("event_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_notification_messages_channel" ON "notification_messages" ("channel")',
    );
    await queryRunner.query(
      'CREATE INDEX "idx_notification_messages_status" ON "notification_messages" ("status")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_notification_messages_status"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_notification_messages_channel"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_notification_messages_event_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_notification_messages_tenant_id"');

    await queryRunner.query('DROP TABLE IF EXISTS "notification_messages"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."notification_messages_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."notification_messages_channel_enum"');
  }
}
