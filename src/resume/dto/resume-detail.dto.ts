import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

export class ResumeDetailDto {
  @IsString()
  title: string;

  @IsString()
  aboutMe: string;

  @IsInt()
  @Min(0)
  applicantId: number;

  @ValidateNested()
  educations: EducationDto[];

  @ValidateNested()
  experiences: ExperienceDto[];

  @ValidateNested()
  languages: LanguageDto[];

  @ValidateNested()
  skills: SkillDto[];
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
  startDate: string;

  @IsString()
  @IsOptional()
  endDate?: string | null;

  @IsBoolean()
  keepStudy: boolean;
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
  startDate: string;

  @IsString()
  @IsOptional()
  endDate?: string | null;

  @IsString()
  description: string;

  @IsBoolean()
  keepWorking: boolean;
}

export class SkillDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  name: string;
}

export class LanguageDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  id?: number;

  @IsInt()
  @Min(1)
  @Max(4)
  level: number;

  @IsString()
  name: string;
}