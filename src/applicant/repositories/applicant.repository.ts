import type { Applicant } from '../entities/applicant.entity';
import type { ESex } from 'src/shared/enums/sex.enum';
import type { EGender } from 'src/shared/enums/gender.enum';
import type { ESexualOrientation } from 'src/shared/enums/sexual-orientation.enum';
import type { EEthnicGroup } from 'src/shared/enums/ethnic-group.enum';
import type {
  CityDto,
  CountryDto,
  DepartmentDto,
} from 'src/geo/dto/geo-option.dto';

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
  countryOfBirthId?: number;
  departmentOfBirthId?: number;
  cityOfBirthId?: number;
  countryOfResidenceId?: number;
  departmentOfResidenceId?: number;
  cityOfResidenceId?: number;
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
  countryOfBirthId?: number | null;
  departmentOfBirthId?: number | null;
  cityOfBirthId?: number | null;
  countryOfResidenceId?: number | null;
  departmentOfResidenceId?: number | null;
  cityOfResidenceId?: number | null;
  countryOfBirth?: CountryDto | null;
  departmentOfBirth?: DepartmentDto | null;
  cityOfBirth?: CityDto | null;
  countryOfResidence?: CountryDto | null;
  departmentOfResidence?: DepartmentDto | null;
  cityOfResidence?: CityDto | null;
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
