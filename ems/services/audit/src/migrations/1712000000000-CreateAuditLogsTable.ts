import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogsTable1712000000000 implements MigrationInterface {
  name = 'CreateAuditLogsTable1712000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        actor_user_id uuid NULL,
        target_user_id uuid NULL,
        domain varchar(32) NOT NULL,
        action varchar(128) NOT NULL,
        before jsonb NULL,
        after jsonb NULL,
        metadata jsonb NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_audit_logs_domain CHECK (domain IN ('auth', 'role', 'tenant'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_logs_tenant_domain_created
      ON audit_logs (tenant_id, domain, created_at DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_logs_actor_created
      ON audit_logs (actor_user_id, created_at DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_logs_target_created
      ON audit_logs (target_user_id, created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_target_created');
    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_actor_created');
    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_tenant_domain_created');
    await queryRunner.query('DROP TABLE IF EXISTS audit_logs');
  }
}
