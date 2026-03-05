export class UpdateExhibitorDto {
  name?: string;
  description?: string | null;
  contactInfo?: Record<string, unknown> | null;
}
