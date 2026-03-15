export class CreateTenantDto {
  name!: string;
  slug!: string;
  timezone?: string;
  locale?: string;
  config?: Record<string, unknown>;
}
