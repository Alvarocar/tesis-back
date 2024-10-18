import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Applicant } from '@models/applicant.model';
import { Recluter } from './models/recluter.model';
import { ENV } from './constants';
import { Education } from './models/education.model';
import { Experience } from './models/experience.model';
import { Language } from './models/language.model';
import { ResumeToLanguage } from './models/resume_to_language.model';
import { Resume } from './models/resume.model';
import { Vacant } from './models/vacant.model';
import { VacantToLanguage } from './models/vacant_to_language.model';
import { PersonalReference } from './models/personal_reference.model';
import { LaboralReference } from './models/laboral_reference.model';
import { Skill } from './models/skill.model';
import { Application } from './models/application.model';

export const AppDataSource = new DataSource({
  type: ENV.POSTGRESS.type,
  host: ENV.POSTGRESS.host,
  port: Number(ENV.POSTGRESS.port),
  username: ENV.POSTGRESS.username,
  password: ENV.POSTGRESS.password,
  database: ENV.POSTGRESS.database,
  synchronize: true,
  logging: ENV.POSTGRESS.logging,
  entities: [
    Applicant,
    Recluter,
    Education,
    Experience,
    Language,
    Recluter,
    ResumeToLanguage,
    Resume,
    VacantToLanguage,
    Vacant,
    PersonalReference,
    LaboralReference,
    Skill,
    Application,
  ],
});
