import { SponsorTier } from '../entities/sponsor-tier.enum';

export class UpdateSponsorProfileDto {
  name?: string;
  description?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  sponsorshipTier?: SponsorTier | null;
  contactInfo?: Record<string, unknown> | null;
  isActive?: boolean;
}
