import { IsString } from 'class-validator';
import { IsDateFormat } from 'src/shared/decorators/is-date-format.decorator';

export class EducationEvaluationDTO {
  @IsString()
  institution: string;

  @IsString()
  fieldOfStudy: string;

  @IsString()
  degree: string;

  @IsDateFormat()
  public readonly startDate: string;

  @IsDateFormat()
  public readonly endDate?: Date;
}
