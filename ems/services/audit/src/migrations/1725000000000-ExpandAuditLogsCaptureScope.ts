import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandAuditLogsCaptureScope1725000000000 implements MigrationInterface {
  name = 'ExpandAuditLogsCaptureScope1725000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS category varchar(32) NOT NULL DEFAULT 'user_action'",
    );
    await queryRunner.query(
      "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS severity varchar(32) NOT NULL DEFAULT 'info'",
    );
    await queryRunner.query('ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type varchar(64) NULL');
    await queryRunner.query('ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id uuid NULL');

    await queryRunner.query('ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS ck_audit_logs_category');
    await queryRunner.query(
      "ALTER TABLE audit_logs ADD CONSTRAINT ck_audit_logs_category CHECK (category IN ('user_action', 'entity_change', 'security_event'))",
    );

    await queryRunner.query('ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS ck_audit_logs_severity');
    await queryRunner.query(
      "ALTER TABLE audit_logs ADD CONSTRAINT ck_audit_logs_severity CHECK (severity IN ('info', 'warning', 'critical'))",
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_category_created
       ON audit_logs (tenant_id, category, created_at DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_tenant_category_created');

    await queryRunner.query('ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS ck_audit_logs_severity');
    await queryRunner.query('ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS ck_audit_logs_category');

    await queryRunner.query('ALTER TABLE audit_logs DROP COLUMN IF EXISTS entity_id');
    await queryRunner.query('ALTER TABLE audit_logs DROP COLUMN IF EXISTS entity_type');
    await queryRunner.query('ALTER TABLE audit_logs DROP COLUMN IF EXISTS severity');
    await queryRunner.query('ALTER TABLE audit_logs DROP COLUMN IF EXISTS category');
  }
}
