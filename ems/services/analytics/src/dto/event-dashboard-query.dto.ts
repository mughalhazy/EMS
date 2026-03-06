import { IsDateString, IsNumberString, IsOptional } from 'class-validator';

export class EventDashboardQueryDto {
  @IsOptional()
  @IsDateString({ strict: true })
  snapshotDate?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  startDate?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  endDate?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
