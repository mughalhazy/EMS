import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthSecurityTables1711000000000 implements MigrationInterface {
  name = 'CreateAuthSecurityTables1711000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE auth_tokens_type_enum AS ENUM ('password_reset', 'email_verification')
    `);

    await queryRunner.query(`
      CREATE TABLE auth_credentials (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        password_changed_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_auth_credentials_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE auth_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        type auth_tokens_type_enum NOT NULL,
        token_hash varchar(128) NOT NULL,
        expires_at timestamptz NOT NULL,
        consumed_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_auth_tokens_lookup
      ON auth_tokens (user_id, type, token_hash)
    `);

    await queryRunner.query(`
      CREATE TABLE auth_user_state (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL UNIQUE,
        email_verified boolean NOT NULL DEFAULT false,
        email_verified_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_auth_user_state_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS auth_user_state');
    await queryRunner.query('DROP INDEX IF EXISTS idx_auth_tokens_lookup');
    await queryRunner.query('DROP TABLE IF EXISTS auth_tokens');
    await queryRunner.query('DROP TABLE IF EXISTS auth_credentials');
    await queryRunner.query('DROP TYPE IF EXISTS auth_tokens_type_enum');
  }
}
