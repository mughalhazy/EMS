export class CreateExhibitorDto {
  name!: string;
  description?: string | null;
  contactInfo?: Record<string, unknown> | null;
}
