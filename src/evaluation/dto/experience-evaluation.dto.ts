import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { IsDateFormat } from 'src/shared/decorators/is-date-format.decorator';

export class ExperienceEvaluationDto {
  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  /**
   * Field for additional comments or details about the experience.
   */
  description: string;

  @IsDateFormat()
  startDate: string;

  @IsOptional()
  @IsDateFormat()
  endDate?: string;
}
