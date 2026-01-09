import { IsString, IsEnum, ValidateNested } from 'class-validator';
import { VacancyJobType } from 'src/shared/enums/vacancy-job-type.enum';
import { SkillEvaluationDTO } from './skill-evaluation.dto';
import { LanguageEvaluationDto } from './language-evaluation.dto';
import { SalaryEvaluationDto } from './salary-evaluation.dto';
import { ExperienceEvaluationDto } from './experience-evaluation.dto';

export class VacancyEvaluationDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @ValidateNested()
  salary: SalaryEvaluationDto;

  @IsString()
  description: string;

  @ValidateNested({ each: true })
  experience: ExperienceEvaluationDto[];

  @IsString()
  @IsEnum(VacancyJobType)
  jobType: VacancyJobType;

  skills: SkillEvaluationDTO[];

  languages: LanguageEvaluationDto[];
}
