import { SpeakerStatus } from '../entities/speaker.entity';

export class CreateSpeakerDto {
  organizationId?: string | null;
  firstName!: string;
  lastName!: string;
  email?: string | null;
  bio?: string | null;
  headline?: string | null;
  companyName?: string | null;
  photoUrl?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  githubUrl?: string | null;
  locationLabel?: string | null;
  expertiseTags?: string[];
  status?: SpeakerStatus;
}
