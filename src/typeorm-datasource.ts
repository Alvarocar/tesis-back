import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Employee } from './employee/entities/employee.entity';
import { Company } from './company/entities/company.entity';
import { Skill } from './shared/entities/skill.entity';
import { Resume } from './resume/entities/resume.entity';
import { Education } from './resume/entities/education.entity';
import { Experience } from './resume/entities/experience.entity';
import { LaboralReference } from './resume/entities/laboral-reference.entity';
import { PersonalReference } from './resume/entities/personal-reference.entity';
import { Applicant } from './applicant/entities/applicant.entity';
import { Language } from './language/entities/language.entity';
import { ResumeLanguage } from './resume/entities/resume-language.entity';
import { Vacancy } from './vacancy/entities/vacancy.entity';
import { VacancyLanguage } from './vacancy/entities/vacancyLanguage.entity';
import { AIModel } from './shared/entities/ia-model.entity';
import { Application } from './application/entities/application.entity';
import {
  RELATIONAL_DB_DATABASE,
  RELATIONAL_DB_HOST,
  RELATIONAL_DB_PORT,
  RELATIONAL_DB_USERNAME,
  RELATIONAL_DB_PASSWORD,
  RELATIONAL_DB_LOGGING,
} from './shared/constants/env.constant';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: RELATIONAL_DB_HOST,
  port: Number(RELATIONAL_DB_PORT),
  username: RELATIONAL_DB_USERNAME,
  password: RELATIONAL_DB_PASSWORD,
  database: RELATIONAL_DB_DATABASE,
  synchronize: false, // Disable in favor of migrations
  migrations: ['src/migrations/**/*.ts'],
  logging: RELATIONAL_DB_LOGGING === 'true',
  entities: [
    Employee,
    Company,
    Skill,
    Resume,
    Education,
    Experience,
    LaboralReference,
    PersonalReference,
    Applicant,
    Language,
    ResumeLanguage,
    Vacancy,
    VacancyLanguage,
    AIModel,
    Application,
  ],
  ssl: {
    rejectUnauthorized: false,
  },
});
