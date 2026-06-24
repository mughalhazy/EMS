import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTicketProductDto {
  @IsString() @IsNotEmpty() eventId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @IsInt() @Min(0) price: number;
  @IsInt() @Min(1) totalCapacity: number;
  @IsDateString() @IsOptional() saleStartAt?: string;
  @IsDateString() @IsOptional() saleEndAt?: string;
}

export class RedeemTicketDto {
  @IsString() @IsNotEmpty() qrCode: string;
}
