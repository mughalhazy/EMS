import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString() @IsNotEmpty() ticketProductId: string;
  @IsInt() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @IsString() @IsNotEmpty() eventId: string;
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
  @IsString() @IsOptional() promoCode?: string;
}
