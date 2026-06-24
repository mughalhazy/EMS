import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString() @IsOptional() bio?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() interests?: string[];
  @IsString() @IsOptional() company?: string;
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() photoUrl?: string;
}

export class AddTagDto {
  @IsString() tag: string;
}
