import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../../src/employee/entities/employee.entity';
import { Company } from '../../src/company/entities/company.entity';
import { Skill } from '../../src/shared/entities/skill.entity';
import { Resume } from '../../src/resume/entities/resume.entity';
import { Education } from '../../src/resume/entities/education.entity';
import { Experience } from '../../src/resume/entities/experience.entity';
import { LaboralReference } from '../../src/resume/entities/laboral-reference.entity';
import { PersonalReference } from '../../src/resume/entities/personal-reference.entity';
import { Applicant } from '../../src/applicant/entities/applicant.entity';
import { Language } from '../../src/language/entities/language.entity';
import { ResumeLanguage } from '../../src/resume/entities/resume-language.entity';
import { Vacancy } from '../../src/vacancy/entities/vacancy.entity';
import { VacancyLanguage } from '../../src/vacancy/entities/vacancyLanguage.entity';
import { AIModel } from '../../src/shared/entities/ia-model.entity';
import { Application } from '../../src/application/entities/application.entity';

export const getTestTypeOrmModule = () => {
  return TypeOrmModule.forRoot({
    type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    synchronize: true,
    logging: false,
    entities: [
      Employee,
      Company,
      Skill,
      Resume,
      Education,
      Experience,
      LaboralReference,
      PersonalReference,
      Language,
      ResumeLanguage,
      Applicant,
      Vacancy,
      VacancyLanguage,
      AIModel,
      Application,
    ],
  });
};
