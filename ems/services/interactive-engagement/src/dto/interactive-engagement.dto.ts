import { IsArray, IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePollDto {
  @IsString() @IsNotEmpty() eventId: string;
  @IsString() @IsOptional() sessionId?: string;
  @IsString() @IsNotEmpty() question: string;
  @IsArray() @IsString({ each: true }) options: string[];
}

export class RespondPollDto {
  @IsString() @IsNotEmpty() attendeeId: string;
  @IsString() @IsNotEmpty() selectedOption: string;
}

export class SubmitQuestionDto {
  @IsString() @IsNotEmpty() eventId: string;
  @IsString() @IsNotEmpty() sessionId: string;
  @IsString() @IsNotEmpty() attendeeId: string;
  @IsString() @IsNotEmpty() question: string;
}

export class CreateSurveyDto {
  @IsString() @IsNotEmpty() eventId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsArray() questions: Record<string, unknown>[];
}

export class SubmitSurveyResponseDto {
  @IsString() @IsNotEmpty() attendeeId: string;
  @IsObject() answers: Record<string, unknown>;
}
