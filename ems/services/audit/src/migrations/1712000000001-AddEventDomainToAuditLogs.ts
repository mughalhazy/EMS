import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventDomainToAuditLogs1712000000001 implements MigrationInterface {
  name = 'AddEventDomainToAuditLogs1712000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS ck_audit_logs_domain');
    await queryRunner.query(
      "ALTER TABLE audit_logs ADD CONSTRAINT ck_audit_logs_domain CHECK (domain IN ('auth', 'role', 'tenant', 'event'))",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS ck_audit_logs_domain');
    await queryRunner.query(
      "ALTER TABLE audit_logs ADD CONSTRAINT ck_audit_logs_domain CHECK (domain IN ('auth', 'role', 'tenant'))",
    );
  }
}
