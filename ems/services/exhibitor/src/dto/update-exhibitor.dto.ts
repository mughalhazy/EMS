import { SponsorTier } from '../entities/sponsor-tier.enum';

export class UpdateExhibitorDto {
  name?: string;
  description?: string | null;
  sponsorshipTier?: SponsorTier | null;
  contactInfo?: Record<string, unknown> | null;
  sponsorPackageId?: string | null;
}
