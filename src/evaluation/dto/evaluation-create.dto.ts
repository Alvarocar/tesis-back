import { ValidateNested } from "class-validator";
import { ResumeEvaluationDTO } from "./resume-evaluation.dto";
import { VacancyEvaluationDto } from "./vacancy-evaluation.dto";

export class EvaluationCreateDto {
    @ValidateNested()
    resume: ResumeEvaluationDTO;

    @ValidateNested()
    vacancy: VacancyEvaluationDto;
}