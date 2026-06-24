import { IsNotEmpty, IsString } from 'class-validator';

export class RequestConnectionDto {
  @IsString() @IsNotEmpty() requesteeId: string;
}
