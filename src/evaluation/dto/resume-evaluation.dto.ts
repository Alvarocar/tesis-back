import { IsString, ValidateNested } from 'class-validator'
import { IsNumberOrString } from 'src/shared/decorators/is-number-or-string.decorator';
import { PersonalReferenceEvaluationDto } from './personal-reference-evaluation.dto';
import { LaboralReferenceEvaluationDto } from './laboral-reference-evaluation.dto';
import { ExperienceEvaluationDto } from './experience-evaluation.dto';
import { EducationEvaluationDTO } from './education-evaluation.dto';
import { LanguageEvaluationDto } from './language-evaluation.dto';
import { SkillEvaluationDTO } from './skill-evaluation.dto';

/**
 * This class works to evaluation controller interface.
 */
export class ResumeEvaluationDTO {
    
    @IsNumberOrString()
    id: number | string;

    @IsString()
    aboutMe: string;

    @ValidateNested()
    skills: SkillEvaluationDTO[];

    @ValidateNested()
    educations: EducationEvaluationDTO[]
    
    @ValidateNested()
    experiences: ExperienceEvaluationDto[]
    
    @ValidateNested()
    languages: LanguageEvaluationDto[]
    
    @ValidateNested()
    laboralReferences: LaboralReferenceEvaluationDto[]

    personalReferences: PersonalReferenceEvaluationDto[]
}