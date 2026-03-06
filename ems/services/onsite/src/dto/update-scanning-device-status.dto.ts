import { IsIn, IsString } from 'class-validator';

export class UpdateScanningDeviceStatusDto {
  @IsString()
  @IsIn(['active', 'inactive'])
  status!: string;
}
