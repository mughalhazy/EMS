export class UpdateTenantSettingsDto {
  timezone?: string;
  locale?: string;
  config?: Record<string, unknown>;
}
