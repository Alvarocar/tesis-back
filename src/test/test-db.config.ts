import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Company } from '../company/entities/company.entity';
import { Skill } from '../shared/entities/skill.entity';
import { Resume } from '../resume/entities/resume.entity';
import { Education } from '../resume/entities/education.entity';
import { Experience } from '../resume/entities/experience.entity';
import { LaboralReference } from '../resume/entities/laboral-reference.entity';
import { PersonalReference } from '../resume/entities/personal-reference.entity';
import { Applicant } from '../applicant/entities/applicant.entity';
import { Language } from '../language/entities/language.entity';
import { ResumeLanguage } from '../resume/entities/resume-language.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { VacancyLanguage } from '../vacancy/entities/vacancyLanguage.entity';
import { AIModel } from '../shared/entities/ia-model.entity';
import { Application } from '../application/entities/application.entity';

/**
 * Configuración de base de datos SQLite en memoria para tests
 */
export const testDbConfig: TypeOrmModuleOptions = {
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
};
