import { Skill } from 'src/shared/entities/skill.entity';
import { Salary } from 'src/shared/entities/salary';
import { Language } from 'src/language/entities/language.entity';
import { ExperienceTime } from 'src/shared/entities/experienceTime';
import { VacancyJobType } from '../enums/vacancy-job-type.enum';

export class Vacancy {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly salary: Partial<Salary>,
    public readonly description: string,
    public readonly experience: ExperienceTime | null,
    public readonly jobType: VacancyJobType,
    public readonly skills: Skill[],
    public readonly languages: Language[],
  ) {}

  requiresExperience(): boolean {
    const months = this.experience?.months ?? 0;
    const years = this.experience?.years ?? 0;

    return months > 0 || years > 0;
  }
}
