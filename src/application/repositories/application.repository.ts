import type { Application } from '../entities/application.entity';
import type { EApplicationStatus } from 'src/shared/enums/application-status.enum';

export interface ResumeHydratedForAI {
  id: number;
  aboutMe: string;
  title: string;
  applicant: {
    id: number;
    firstName: string;
    lastName: string | null;
    phoneNumber: string | null;
  };
  educations: {
    id: number;
    title: string;
    institute: string;
    keepStudy: boolean | null;
    startDate: Date;
    endDate: Date | null;
  }[];
  experiences: {
    id: number;
    rol: string;
    company: string;
    startDate: Date;
    endDate: Date | null;
    description: string;
    keepWorking: boolean | null;
  }[];
  languages: {
    id: number;
    level: number;
    language: { id: number; name: string };
  }[];
  skills: { id: number; name: string }[];
}

export interface VacancyHydratedForAI {
  id: number;
  title: string;
  description: string;
  salaryOffer: number | null;
  jobType: string;
  experienceYears: number | null;
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
