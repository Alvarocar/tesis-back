import type { Resume } from '../entities/resume.entity';
import type { SkillDto } from '../dto/resume-detail.dto';

export interface CreateResumeData {
  title: string;
  applicantId: number;
}

export interface UpdateResumeData {
  title?: string;
  aboutMe?: string;
}

export interface ResumeDetailHydrated {
  id: number;
  title: string;
  aboutMe: string;
  applicantId: number;
  educations: {
    id: number;
    institute: string;
    keepStudy: boolean | null;
    startDate: Date;
    endDate: Date | null;
    title: string;
  }[];
  experiences: {
    id: number;
    company: string;
    description: string;
    keepWorking: boolean | null;
    rol: string;
    startDate: Date;
    endDate: Date | null;
  }[];
  languages: { id: number; level: number; name: string }[];
  skills: SkillDto[];
}

export interface ResumeOverviewRow {
  id: number;
  title: string;
  aboutMe: string;
  modificationDate: Date;
}

export const RESUME_REPOSITORY = Symbol('RESUME_REPOSITORY');

export interface ResumeRepositoryPort {
  insert(data: CreateResumeData & { creationDate: Date }): Promise<Resume>;
  update(
    id: number,
    applicantId: number,
    data: UpdateResumeData,
  ): Promise<void>;
  softDelete(id: number, applicantId: number): Promise<void>;

  findDetailByIdAndApplicant(
    id: number,
    applicantId: number,
  ): Promise<ResumeDetailHydrated | null>;

  listOverviewByApplicant(applicantId: number): Promise<ResumeOverviewRow[]>;

  existsOwned(id: number, applicantId: number): Promise<boolean>;

  /**
   * Validación liviana de ownership para sub-recursos
   * (educations/experiences/languages/skills).
   * Devuelve boolean en lugar de cargar filas.
   */
  validateOwnership(input: {
    resumeId: number;
    applicantId: number;
  }): Promise<boolean>;
}
