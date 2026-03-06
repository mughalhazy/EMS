import { IsDateString, IsOptional } from 'class-validator';

export class RevenueReportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
