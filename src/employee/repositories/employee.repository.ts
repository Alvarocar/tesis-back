import type { EmployeeRole } from '../enums/employee-role.enum';

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  companyId: number;
  invitationToken: string;
  invitationTokenExpires: Date;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
}

export interface EmployeeListRow {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  role: EmployeeRole;
  hasAccount: boolean;
}

export interface EmployeeWithCompanyId {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  companyId: number;
  invitationToken: string | null;
  invitationTokenExpires: Date | null;
  isActive: boolean;
  password: string | null;
}

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface EmployeeRepositoryPort {
  insert(data: CreateEmployeeData): Promise<EmployeeWithCompanyId>;

  findById(id: number): Promise<EmployeeWithCompanyId | null>;
  findByEmail(email: string): Promise<EmployeeWithCompanyId | null>;
  findByInvitationToken(token: string): Promise<EmployeeWithCompanyId | null>;
  findByCompanyAndId(
    id: number,
    companyId: number,
    opts?: { includeRelations?: boolean },
  ): Promise<EmployeeWithCompanyId | null>;
  validateOwnership(employeeId: number, companyId: number): Promise<boolean>;

  searchByCompany(
    companyId: number,
    pagination: { page: number; pageSize: number },
  ): Promise<{ data: EmployeeListRow[]; total: number }>;

  setInvitationToken(
    employeeId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void>;

  clearInvitationToken(employeeId: number): Promise<void>;

  setPassword(employeeId: number, hashedPassword: string): Promise<void>;

  delete(employeeId: number): Promise<void>;

  reassignVacancies(
    fromEmployeeId: number,
    toEmployeeId: number,
  ): Promise<void>;
}
