import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { VacancyJobType } from 'src/shared/enums/vacancy-job-type.enum';

export class CreateResumeDto {
  @IsString()
  @MaxLength(60)
  title: string;

  /**
   * Modalidad de trabajo deseada. Reutiliza `VacancyJobType` porque el
   * dominio del vacancy es el mismo (Remoto / Hibrido / Presencial).
   * Opcional en la creacion: el egresado puede definirla mas adelante.
   */
  @IsEnum(VacancyJobType)
  @IsOptional()
  workModality?: VacancyJobType | null;
}
