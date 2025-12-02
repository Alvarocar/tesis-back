import { Resume } from "src/shared/entities/resume";
import { Vacancy } from "src/shared/entities/vacancy";
import { Education } from "src/shared/entities/education";
import { Experience } from "src/shared/entities/experience";
import { ResumeEvaluationDTO } from "../dto/resume-evaluation.dto";
import { VacancyEvaluationDto } from "../dto/vacancy-evaluation.dto";

export function mapResumeEvaluationToEntity(evaluation: ResumeEvaluationDTO): Resume {
    const resume = new Resume(
        evaluation.id,
        evaluation.aboutMe,
        evaluation.skills,
        evaluation.educations.map<Education>(edu => ({ ...edu,  startDate: new Date(edu.startDate), endDate: edu.endDate ? new Date(edu.endDate) : undefined })),
        evaluation.experiences.map<Experience>(exp => ({ ...exp, startDate: new Date(exp.startDate), endDate: exp.endDate ? new Date(exp.endDate) : undefined })),
        evaluation.languages,
        evaluation.laboralReferences,
    );
    return resume;
}


export function mapVacancyEvaluationToEntity(evaluation: VacancyEvaluationDto): Vacancy {
    const vacancy = new Vacancy(
        evaluation.id,
        evaluation.title,
        evaluation.,
        evaluation.jobType,
        evaluation.skills,
        evaluation.languages,
    );
    return vacancy;
}