import { Injectable, Logger } from '@nestjs/common';

/**
 * Placeholder secrets facade for future managed secret-store integrations.
 *
 * TODO(secrets-integration): Replace environment fallback resolution with
 * an implementation backed by a managed secret provider (e.g. AWS Secrets
 * Manager, HashiCorp Vault, GCP Secret Manager).
 */
@Injectable()
export class SecretsProviderService {
  private readonly logger = new Logger(SecretsProviderService.name);
  private readonly backend = process.env.SECRETS_BACKEND ?? 'env';

  getSecret(name: string, fallback?: string): string {
    if (this.backend !== 'env') {
      this.logger.warn(
        `Secrets backend "${this.backend}" configured, but managed provider integration is not implemented yet. Falling back to environment variables.`,
      );
    }

    return process.env[name] ?? fallback ?? '';
  }

  getBackend(): string {
    return this.backend;
  }
}
