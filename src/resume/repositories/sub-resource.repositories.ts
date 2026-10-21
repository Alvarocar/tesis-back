import type { Education } from '../entities/education.entity';
import type { Experience } from '../entities/experience.entity';
import type { Language } from 'src/language/entities/language.entity';
import type { Skill } from 'src/shared/db/entities/skill.entity';
import type { Knowledge } from 'src/shared/db/entities/knowledge.entity';
import type { EEducationLevel } from 'src/shared/enums/education-level.enum';

/**
 * Puerto compartido para los repos de "sub-recursos" de un resume
 * (educations, experiences, languages, skills). Cada uno expone
 * un método `port` específico para su requerimiento.
 */

/**
 * Mini-port para los sub-recursos del resume, que solo necesitan
 * validar ownership (resumeId pertenece al applicant del user).
 */
export interface ResumeMinimalPort {
  validateOwnership(input: {
    resumeId: number;
    applicantId: number;
  }): Promise<boolean>;
}

export interface EducationPort {
  upsert(input: EducationUpsertInput): Promise<Education>;
  deleteOwned(input: {
    educationId: number;
    resumeId: number;
  }): Promise<boolean>;
  existsOwned(input: {
    educationId: number;
    resumeId: number;
  }): Promise<boolean>;
}

export interface ExperiencePort {
  upsert(input: ExperienceUpsertInput): Promise<Experience>;
  deleteOwned(input: {
    experienceId: number;
    resumeId: number;
  }): Promise<boolean>;
  existsOwned(input: {
    experienceId: number;
    resumeId: number;
  }): Promise<boolean>;
}

export interface LanguagePort {
  searchByTerm(term: string): Promise<Language[]>;
  listAll(): Promise<Language[]>;
  listByResume(resumeId: number): Promise<
    {
      id: number;
      level: number;
      name: string;
    }[]
  >;
  replaceForResume(input: {
    resumeId: number;
    languages: { id?: number; name: string; level: number }[];
  }): Promise<void>;
  findOrCreateManyByName(names: string[]): Promise<Language[]>;
}

export interface SkillPort {
  replaceForResume(input: {
    resumeId: number;
    skills: { id?: number; name: string }[];
  }): Promise<void>;
  findOrCreateManyByName(names: string[]): Promise<Skill[]>;
  listByResume(resumeId: number): Promise<Skill[]>;
}

export interface KnowledgePort {
  replaceForResume(input: {
    resumeId: number;
    knowledge: { id?: number; name: string }[];
  }): Promise<void>;
  findOrCreateManyByName(names: string[]): Promise<Knowledge[]>;
  listByResume(resumeId: number): Promise<Knowledge[]>;
}

/* ------------------------------- Inputs ------------------------------- */

export interface EducationUpsertInput {
  id?: number;
  resumeId: number;
  institute: string;
  title: string;
  startDate: Date;
  endDate?: Date | null;
  keepStudy?: boolean;
  educationLevel?: EEducationLevel | null;
  programName?: string | null;
  /** FK a `country.id`.-education usa solo pais (sin departamento/ciudad). */
  countryId?: number | null;
}

export interface ExperienceUpsertInput {
  id?: number;
  resumeId: number;
  company: string;
  rol: string;
  description: string;
  startDate: Date;
  endDate?: Date | null;
  keepWorking?: boolean;
  /** FKs a `country.id` / `department.id` / `city.id`. */
  countryId?: number | null;
  departmentId?: number | null;
  cityId?: number | null;
}

/* ------------------------------- SYMBOLS -------------------------------- */

export const EDUCATION_REPOSITORY = Symbol('EDUCATION_REPOSITORY');
export const EXPERIENCE_REPOSITORY = Symbol('EXPERIENCE_REPOSITORY');
export const LANGUAGE_REPOSITORY = Symbol('LANGUAGE_REPOSITORY');
export const SKILL_REPOSITORY = Symbol('SKILL_REPOSITORY');
export const KNOWLEDGE_REPOSITORY = Symbol('KNOWLEDGE_REPOSITORY');
export const RESUME_REPOSITORY_MIN = Symbol('RESUME_REPOSITORY_MIN');
