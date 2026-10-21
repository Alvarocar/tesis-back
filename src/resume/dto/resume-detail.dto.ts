import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { VacancyJobType } from 'src/shared/enums/vacancy-job-type.enum';
import { EEducationLevel } from 'src/shared/enums/education-level.enum';
import type {
  CityDto,
  CountryDto,
  DepartmentDto,
} from 'src/geo/dto/geo-option.dto';

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

  @IsOptional()
  @IsEnum(VacancyJobType)
  workModality?: VacancyJobType | null;

  @ValidateNested()
  @IsOptional()
  knowledge?: KnowledgeDto[];
}

export class EducationDto {
  @IsNumber()
  @IsOptional()
  id?: number;

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

  @IsString()
  @IsOptional()
  programName?: string | null;

  @IsEnum(EEducationLevel)
  @IsOptional()
  educationLevel?: EEducationLevel | null;

  /**
   * Entrada: FK plana (lo que viaja al guardar).
   * Salida (detalle): objeto geo hydrated (ver `ResumeDetailDto.educations`).
   */
  @IsNumber()
  @IsOptional()
  countryId?: number | null;

  /** Presente solo en la respuesta de detalle. */
  @IsOptional()
  country?: CountryDto | null;
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

  /**
   * Entrada: FKs planas (lo que viaja al guardar).
   * Salida (detalle): objetos geo hydrated (ver `ResumeDetailDto.experiences`).
   */
  @IsNumber()
  @IsOptional()
  countryId?: number | null;

  @IsNumber()
  @IsOptional()
  departmentId?: number | null;

  @IsNumber()
  @IsOptional()
  cityId?: number | null;

  /** Presentes solo en la respuesta de detalle. */
  @IsOptional()
  country?: CountryDto | null;

  @IsOptional()
  department?: DepartmentDto | null;

  @IsOptional()
  city?: CityDto | null;
}

export class SkillDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  name: string;
}

export class KnowledgeDto {
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
