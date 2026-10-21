import type { Application } from '../entities/application.entity';
import type { EApplicationStatus } from 'src/shared/enums/application-status.enum';
import type { VacancyJobType } from 'src/shared/enums/vacancy-job-type.enum';
import type { EEducationLevel } from 'src/shared/enums/education-level.enum';
import type { ESex } from 'src/shared/enums/sex.enum';
import type { EGender } from 'src/shared/enums/gender.enum';
import type { ESexualOrientation } from 'src/shared/enums/sexual-orientation.enum';
import type { EEthnicGroup } from 'src/shared/enums/ethnic-group.enum';

export interface GeoHydratedForAI {
  id: number;
  name: string;
}

export interface ApplicantHydratedForAI {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  direction: string | null;
  identification: string | null;
  birthDate: Date | null;
  sex: ESex | null;
  genre: EGender | null;
  sexualOrientation: ESexualOrientation | null;
  ethnicGroup: EEthnicGroup | null;
  salaryAspiration: number | null;
  countryOfBirth: GeoHydratedForAI | null;
  departmentOfBirth: GeoHydratedForAI | null;
  cityOfBirth: GeoHydratedForAI | null;
  countryOfResidence: GeoHydratedForAI | null;
  departmentOfResidence: GeoHydratedForAI | null;
  cityOfResidence: GeoHydratedForAI | null;
}

export interface EducationHydratedForAI {
  id: number;
  title: string;
  institute: string;
  educationLevel: EEducationLevel | null;
  programName: string | null;
  keepStudy: boolean | null;
  startDate: Date;
  endDate: Date | null;
  country: GeoHydratedForAI | null;
}

export interface ExperienceHydratedForAI {
  id: number;
  rol: string;
  company: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  keepWorking: boolean | null;
  country: GeoHydratedForAI | null;
  department: GeoHydratedForAI | null;
  city: GeoHydratedForAI | null;
}

export interface ResumeHydratedForAI {
  id: number;
  aboutMe: string;
  title: string;
  modificationDate: Date;
  workModality: VacancyJobType | null;
  applicant: ApplicantHydratedForAI;
  educations: EducationHydratedForAI[];
  experiences: ExperienceHydratedForAI[];
  languages: {
    id: number;
    level: number;
    language: { id: number; name: string };
  }[];
  skills: { id: number; name: string }[];
  knowledge: { id: number; name: string }[];
}

export interface VacancyHydratedForAI {
  id: number;
  title: string;
  description: string;
  salaryOffer: number | null;
  jobType: string;
  experienceYears: number | null;
  modificationDate: Date;
  company: string | null;
}

export interface ApplicationHydratedForAI {
  id: number;
  status: typeof EApplicationStatus.APPLIED;
  affinity: number | null;
  feedBack: string | null;
  creationDate: Date;
  resume: ResumeHydratedForAI;
  vacancy: VacancyHydratedForAI;
}

export interface CreateApplicationData {
  resumeId: number;
  vacancyId: number;
  status: EApplicationStatus;
  creationDate: Date;
}

export interface UpdateAnalysisData {
  affinity: number;
  feedBack: string;
  iaTimeTaken: number;
  status: EApplicationStatus;
  inputTokens: number;
  outputTokens: number;
  aiModelId: number;
}

export const APPLICATION_REPOSITORY = Symbol('APPLICATION_REPOSITORY');

export interface ApplicationRepositoryPort {
  /** Crea una nueva application. */
  insert(data: CreateApplicationData): Promise<{ id: number }>;

  /**
   * Busca la application con todo el árbol hidratado para análisis con IA.
   * - Selección explícita (sin over-fetch).
   * - Una sola query (7 joins nested).
   */
  findHydratedForAI(
    applicationId: number,
  ): Promise<ApplicationHydratedForAI | null>;

  /**
   * Búsqueda con paginación + joins selectivos.
   */
  searchByVacancy(
    vacancyId: number,
    pagination: { page: number; pageSize: number },
  ): Promise<{ data: Application[]; total: number }>;

  /**
   * Lista todas las applications ANALYZED.
   */
  listAnalyzed(): Promise<
    {
      id: number;
      creationDate: Date;
      vacancyTitle: string;
      applicantName: string;
    }[]
  >;

  /**
   * Persiste los resultados del análisis.
   * Devuelve afectado > 0 si tuvo éxito.
   */
  updateAnalysisResults(
    applicationId: number,
    data: UpdateAnalysisData,
  ): Promise<boolean>;

  /**
   * ¿Existe ya una application con esa vacante y resume?
   */
  existsForResumeAndVacancy(
    resumeId: number,
    vacancyId: number,
  ): Promise<boolean>;

  /** Necesario para el resultado de `searchByVacancy`. */
  Application: unknown;
}
