import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { DomUtil } from 'src/shared/utils/dom.util';
import { VacancyJobType } from '../enums/vacancy-job-type.enum';

export class CreateVacancyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => DomUtil.sanitizeHtml(value))
  description: string;

  @IsNumber()
  @IsPositive()
  salary: number;

  @IsEnum(VacancyJobType)
  jobType: VacancyJobType;

  @IsNumber()
  @IsOptional()
  experienceYears: number;
}
