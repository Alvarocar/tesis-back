import type { Applicant } from '../entities/applicant.entity';
import type { ECountry } from 'src/shared/enums/country.enum';
import type { ESex } from 'src/shared/enums/sex.enum';
import type { EGender } from 'src/shared/enums/gender.enum';
import type { ESexualOrientation } from 'src/shared/enums/sexual-orientation.enum';
import type { EEthnicGroup } from 'src/shared/enums/ethnic-group.enum';

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
  countryOfBirth?: ECountry;
  departmentOfBirth?: string;
  cityOfBirth?: string;
  countryOfResidence?: ECountry;
  departmentOfResidence?: string;
  cityOfResidence?: string;
  sex?: ESex;
  genre?: EGender;
  sexualOrientation?: ESexualOrientation;
  ethnicGroup?: EEthnicGroup;
  salaryAspiration?: number;
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
  countryOfBirth?: ECountry | null;
  departmentOfBirth?: string | null;
  cityOfBirth?: string | null;
  countryOfResidence?: ECountry | null;
  departmentOfResidence?: string | null;
  cityOfResidence?: string | null;
  sex?: ESex | null;
  genre?: EGender | null;
  sexualOrientation?: ESexualOrientation | null;
  ethnicGroup?: EEthnicGroup | null;
  salaryAspiration?: number | null;
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
