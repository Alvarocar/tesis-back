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

export class VacancyDetailDto {
  @IsNumber()
  @IsPositive()
  id: number;

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

  /**
   * Mismo valor que `salary`. El front (`TJob` / `VacancyContext`) lee
   * `salaryOffer`, así que el detalle de postulación lo expone con ese nombre.
   */
  @IsNumber()
  @IsOptional()
  salaryOffer?: number;

  @IsEnum(VacancyJobType)
  jobType: VacancyJobType;

  @IsNumber()
  @IsOptional()
  experienceYears: number;

  /**
   * Nombre de la empresa dueña de la vacante. Opcional porque el módulo de
   * vacancy lo resuelve por separado; el detalle de application sí lo expone.
   */
  @IsString()
  @IsOptional()
  company?: string | null;

  /** Fecha de última modificación de la vacante. */
  @IsString()
  @IsOptional()
  modificationDate?: string;
}
