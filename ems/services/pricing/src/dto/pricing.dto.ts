import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePromoCodeDto {
  @IsString() @IsNotEmpty() eventId: string;
  @IsString() @IsNotEmpty() code: string;
  @IsIn(['percent', 'fixed']) discountType: 'percent' | 'fixed';
  @IsInt() @Min(1) discountValue: number;
  @IsInt() @Min(1) @IsOptional() maxUses?: number;
  @IsDateString() @IsOptional() expiresAt?: string;
  @IsBoolean() @IsOptional() active?: boolean;
}

export class ValidatePromoCodeDto {
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() eventId: string;
}
