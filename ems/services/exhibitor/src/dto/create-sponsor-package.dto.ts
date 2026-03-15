export class CreateSponsorPackageDto {
  name!: string;
  description?: string | null;
  price?: string | null;
  benefits?: Record<string, unknown> | null;
  isActive?: boolean;
}
