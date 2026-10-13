import type { Repository } from 'typeorm';
import { VacancyStatus } from 'src/vacancy/enums/vacancy-status.enum';
import type { Vacancy } from 'src/vacancy/entities/vacancy.entity';

/**
 * Puerto (interfaz) para el repositorio de Vacancy.
 * Vive en el módulo de dominio; los use-cases dependen de esta interfaz,
 * nunca de la implementación concreta. DIP.
 */
export interface VacancySearchCriteria {
  employeeId?: number;
  status?: VacancyStatus;
  statusIn?: VacancyStatus[];
  text?: string;
}

export interface PublicJobSearchCriteria {
  status?: VacancyStatus;
  text?: string;
}

export interface CreateVacancyData {
  title: string;
  description: string;
  experienceYears?: number;
  salaryOffer?: number;
  jobType: Vacancy['jobType'];
  maxApplicantCount?: number;
  employeeId: number;
}

export interface UpdateVacancyData {
  title?: string;
  description?: string;
  experienceYears?: number;
  salaryOffer?: number;
  jobType?: Vacancy['jobType'];
  maxApplicantCount?: number;
  status?: VacancyStatus;
}

export interface JobSearchResultRow {
  id: number;
  title: string;
  description: string;
  experienceYears: number | null;
  salaryOffer: number | null;
  jobType: Vacancy['jobType'];
  creationDate: Date;
  modificationDate: Date;
  status: VacancyStatus;
  companyId: number;
  companyName: string;
  employeeOwnerId: number;
}

export interface VacancyWithOverview {
  id: number;
  title: string;
  description: string;
  experienceYears: number | null;
  salaryOffer: number | null;
  jobType: Vacancy['jobType'];
  creationDate: Date;
  modificationDate: Date;
  employeeId: number;
  editable: boolean;
}

export const VACANCY_REPOSITORY = Symbol('VACANCY_REPOSITORY');

/** Puerto. Token DI para inyectar la implementación. */
export interface VacancyRepositoryPort {
  insert(input: CreateVacancyData): Promise<Vacancy>;
  update(id: number, data: UpdateVacancyData): Promise<void>;
  archive(id: number): Promise<void>;

  findByIdAndCompany(
    id: number,
    companyId: number,
    status?: VacancyStatus,
  ): Promise<Vacancy | null>;

  findByIdWithEmployee(id: number): Promise<Vacancy | null>;

  existsById(id: number): Promise<boolean>;
  searchByCriteria(
    criteria: VacancySearchCriteria,
  ): Promise<{ data: Vacancy[]; total: number }>;

  /** Búsqueda pública (front sin auth o con Applicant). */
  searchPublic(
    criteria: PublicJobSearchCriteria,
    pagination: { page: number; pageSize: number },
  ): Promise<{ data: JobSearchResultRow[]; total: number }>;

  /**
   * Detalle de vacante con join a employee + company, todo en una query
   * con `select` explícito. Usado por el public job detail.
   */
  findDetailById(id: number): Promise<{
    id: number;
    title: string;
    description: string;
    experienceYears: number | null;
    salaryOffer: number | null;
    modificationDate: Date;
    jobType: Vacancy['jobType'];
    status: VacancyStatus;
    companyId: number | null;
    companyName: string | null;
    employeeOwnerId: number;
  } | null>;

  countByStatus(status: VacancyStatus): Promise<number>;
}

/** Tipo helper para TS cuando se inyecta el puerto por símbolo. */
export type VacancyRepository = VacancyRepositoryPort;

/**
 * Re-export para que `TypeOrmModule.forFeature([Vacancy])` siga encontrando
 * el entity desde el módulo. Re-uso del alias `Repository<T>` de TypeORM.
 */
export type VacancyTypeOrmRepo = Repository<Vacancy>;
