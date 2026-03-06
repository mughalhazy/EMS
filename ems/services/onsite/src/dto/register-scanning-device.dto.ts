import { IsIn, IsString } from 'class-validator';

export class RegisterScanningDeviceDto {
  @IsString()
  deviceId!: string;

  @IsString()
  @IsIn(['active', 'inactive'])
  status!: string;
}
