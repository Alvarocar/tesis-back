import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class ResumeDto {
  @IsString()
  knowledge: string;

  @IsString()
  contact_info: string;

  @IsString()
  about_me: string;

  @IsInt()
  @Min(0)
  applicant_id: number;

  @ValidateNested()
  educations: EducationDto[];

  @ValidateNested()
  experiences: ExperienceDto[];

  @ValidateNested()
  language: LanguageDto[];
}
export class CreateAboutMeDto {
  @IsNumber()
  resume_id: number;
  @IsString()
  about_me: string;
}

export class CreateResumeDto {
  @IsString()
  @MaxLength(60)
  title: string;
}

export class LanguageDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  id?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  level: number;

  @IsString()
  name: string;
}

export class ExperienceDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  rol: string;

  @IsString()
  company: string;

  @IsString()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date: string;

  @IsString()
  description: string;

  @IsBoolean()
  keep_working: boolean;
}

export class EducationDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  institute: string;

  @IsString()
  title: string;

  @IsString()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date: string;

  @IsBoolean()
  keep_study: boolean;
}

export class SkillDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  name: string;
}
