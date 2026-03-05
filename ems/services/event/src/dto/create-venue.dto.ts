import { VenueType } from '../entities/venue.entity';

export class CreateVenueDto {
  name!: string;
  type!: VenueType;
  addressLine1?: string | null;
  city?: string | null;
  country?: string | null;
  virtualUrl?: string | null;
  capacity?: number | null;
}
