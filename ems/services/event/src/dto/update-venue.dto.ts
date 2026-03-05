import { VenueType } from '../entities/venue.entity';

export class UpdateVenueDto {
  name?: string;
  type?: VenueType;
  addressLine1?: string | null;
  city?: string | null;
  country?: string | null;
  virtualUrl?: string | null;
  capacity?: number | null;
}
