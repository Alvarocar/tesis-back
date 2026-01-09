import { Resume } from './resume';
import { Vacancy } from './vacancy';

export class Evaluation {
  constructor(
    private readonly resume: Resume,
    private readonly vacancy: Vacancy,
  ) {}

  getResume(): Resume {
    return this.resume;
  }

  getVacancy(): Vacancy {
    return this.vacancy;
  }
}
