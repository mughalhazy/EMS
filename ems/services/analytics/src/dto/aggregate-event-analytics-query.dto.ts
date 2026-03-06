import { IsDateString, IsOptional } from 'class-validator';

export class AggregateEventAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  snapshotDate?: string;
}
