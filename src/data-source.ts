import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Applicant } from '@models/applicant.model';
import { Recruiter } from './models/recluter.model';
import { ENV } from './constants';
import { Education } from './models/education.model';
import { Experience } from './models/experience.model';
import { Language } from './models/language.model';
import { ResumeLanguage } from './models/resume_to_language.model';
import { Resume } from './models/resume.model';
import { Vacant } from './models/vacant.model';
import { VacantToLanguage } from './models/vacant_to_language.model';
import { PersonalReference } from './models/personal_reference.model';
import { LaboralReference } from './models/laboral_reference.model';
import { Skill } from './models/skill.model';
import { Application } from './models/application.model';
import { AIModel } from './models/aiModel.model';
import { Position } from './models/position.model';
import { Contract } from './models/contract.model';
import { VacancySkill } from './models/vacancySkill.model';

export const AppDataSource = new DataSource({
  type: ENV.POSTGRESS.type,
  host: ENV.POSTGRESS.host,
  port: Number(ENV.POSTGRESS.port),
  username: ENV.POSTGRESS.username,
  password: ENV.POSTGRESS.password,
  database: ENV.POSTGRESS.database,
  synchronize: ENV.POSTGRESS.synchronize,
  logging: ENV.POSTGRESS.logging,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [
    Applicant,
    Recruiter,
    Resume,
    Vacant,
    AIModel,
    Education,
    Experience,
    Language,
    ResumeLanguage,
    VacantToLanguage,
    PersonalReference,
    LaboralReference,
    Skill,
    Application,
    Position,
    Contract,
    VacancySkill,
  ],
});
