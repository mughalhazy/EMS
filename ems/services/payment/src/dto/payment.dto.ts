import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString() @IsNotEmpty() orderId: string;
  @IsInt() @Min(0) amountCents: number;
  @IsString() @IsOptional() currency?: string;
  @IsString() @IsOptional() provider?: string;
}

export class CompletePaymentDto {
  @IsString() @IsOptional() providerRef?: string;
}

export class RefundDto {
  @IsInt() @Min(1) amountCents: number;
  @IsString() @IsOptional() reason?: string;
}
