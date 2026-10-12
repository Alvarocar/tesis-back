import type { Applicant } from '../entities/applicant.entity';

export interface CreateApplicantData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface UpdateApplicantData {
  firstName?: string;
  lastName?: string;
  identification?: string;
  phoneNumber?: string;
  birthDate?: Date;
  direction?: string;
}

export interface ApplicantOverview {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  birthDate: Date | null;
  identification: string | null;
  phoneNumber: string | null;
  direction: string | null;
  password: string;
}

export const APPLICANT_REPOSITORY = Symbol('APPLICANT_REPOSITORY');

export interface ApplicantRepositoryPort {
  insert(
    data: CreateApplicantData & { creationDate: Date },
  ): Promise<Applicant>;
  update(id: number, data: UpdateApplicantData): Promise<void>;
  softDelete(id: number): Promise<void>;
  findById(id: number): Promise<Applicant | null>;
  findByEmail(email: string): Promise<Applicant | null>;
  findByInvitationToken(token: string): Promise<Applicant | null>;
  findByIdOverview(id: number): Promise<ApplicantOverview | null>;
  setPasswordResetToken(
    id: number,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  clearPasswordResetToken(id: number): Promise<void>;
}
