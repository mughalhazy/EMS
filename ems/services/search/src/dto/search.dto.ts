import { IsIn, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { SearchEntityType } from '../entities/search-document.entity';

export class SearchQueryDto {
  @IsString() @IsNotEmpty() q: string;

  @IsOptional()
  @IsIn(['event', 'session', 'speaker', 'exhibitor', 'attendee'])
  type?: SearchEntityType;

  @IsOptional() @IsString() eventId?: string;
}
