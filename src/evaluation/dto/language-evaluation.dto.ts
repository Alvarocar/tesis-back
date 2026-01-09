import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LanguageEvaluationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  level: string; // "basic" | "intermediate" | "advanced" | "native"
}
