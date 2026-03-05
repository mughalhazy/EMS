import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthSsoTables1712000000000 implements MigrationInterface {
  name = 'CreateAuthSsoTables1712000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE auth_sso_providers_type_enum AS ENUM ('oauth2', 'saml')
    `);

    await queryRunner.query(`
      CREATE TABLE auth_sso_providers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        type auth_sso_providers_type_enum NOT NULL,
        slug varchar(100) NOT NULL,
        name varchar(200) NOT NULL,
        enabled boolean NOT NULL DEFAULT true,
        configuration jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_auth_sso_providers_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_auth_sso_providers_tenant_slug
      ON auth_sso_providers (tenant_id, slug)
    `);

    await queryRunner.query(`
      CREATE TABLE auth_federated_identities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id uuid NOT NULL,
        user_id uuid NOT NULL,
        subject varchar(320) NOT NULL,
        email varchar(320) NULL,
        first_name varchar(100) NULL,
        last_name varchar(100) NULL,
        last_authenticated_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_auth_federated_identities_provider FOREIGN KEY (provider_id) REFERENCES auth_sso_providers(id) ON DELETE CASCADE,
        CONSTRAINT fk_auth_federated_identities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_auth_federated_identity_provider_subject
      ON auth_federated_identities (provider_id, subject)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_auth_federated_identities_user_id
      ON auth_federated_identities (user_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_auth_federated_identities_user_id');
    await queryRunner.query('DROP INDEX IF EXISTS uq_auth_federated_identity_provider_subject');
    await queryRunner.query('DROP TABLE IF EXISTS auth_federated_identities');
    await queryRunner.query('DROP INDEX IF EXISTS uq_auth_sso_providers_tenant_slug');
    await queryRunner.query('DROP TABLE IF EXISTS auth_sso_providers');
    await queryRunner.query('DROP TYPE IF EXISTS auth_sso_providers_type_enum');
  }
}
