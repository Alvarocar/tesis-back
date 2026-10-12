import type { Company } from '../entities/company.entity';

export interface CreateCompanyData {
  name: string;
  address?: string;
  phone?: string;
  nit: string;
}

export interface UpdateCompanyData {
  name?: string;
  address?: string;
  phone?: string;
  nit?: string;
}

export interface CompanyWithEmployeeCount {
  id: number;
  name: string;
  nit: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  employeeCount: number;
}

export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');

export interface CompanyRepositoryPort {
  insert(data: CreateCompanyData): Promise<Company>;
  update(id: number, data: UpdateCompanyData): Promise<void>;
  deactivate(id: number): Promise<void>;
  findActiveById(id: number): Promise<Company | null>;
  findByNit(nit: string): Promise<Company | null>;
  findWithEmployeeCount(id: number): Promise<CompanyWithEmployeeCount | null>;
  listActive(): Promise<CompanyWithEmployeeCount[]>;
}
