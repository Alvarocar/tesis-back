import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  type CompanyRepositoryPort,
  type CompanyWithEmployeeCount,
  type CreateCompanyData,
  type UpdateCompanyData,
} from './company.repository';

/**
 * Adapter TypeORM para `CompanyRepositoryPort`.
 *
 * - `findWithEmployeeCount` y `listActive` usan `loadRelationCountAndMap`
 *   para que el conteo venga en la misma query, sin N+1.
 */
@Injectable()
export class CompanyTypeOrmRepository implements CompanyRepositoryPort {
  private readonly logger = new StructuredLogger('CompanyRepository');

  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
  ) {}

  async insert(data: CreateCompanyData): Promise<Company> {
    return this.logger.timed(
      'company.repo.insert',
      async () => {
        const entity = this.repo.create({
          ...data,
          creationDate: new Date(),
          modificationDate: new Date(),
        });
        await this.repo.insert(entity);
        return entity;
      },
      { nit: data.nit },
    );
  }

  async update(id: number, data: UpdateCompanyData): Promise<void> {
    await this.logger.timed(
      'company.repo.update',
      async () => {
        await this.repo.update({ id }, data);
      },
      { companyId: id },
    );
  }

  async deactivate(id: number): Promise<void> {
    await this.repo.update({ id }, { isActive: false });
  }

  async findActiveById(id: number): Promise<Company | null> {
    return this.repo.findOne({ where: { id, isActive: true } });
  }

  async findByNit(nit: string): Promise<Company | null> {
    return this.repo.findOne({ where: { nit } });
  }

  async findWithEmployeeCount(
    id: number,
  ): Promise<CompanyWithEmployeeCount | null> {
    return this.logger.timed(
      'company.repo.findWithCount',
      async () => {
        const row = await this.repo
          .createQueryBuilder('c')
          .select([
            'c.id',
            'c.name',
            'c.nit',
            'c.address',
            'c.phone',
            'c.isActive',
          ])
          .loadRelationCountAndMap('c.employeeCount', 'c.employees')
          .where('c.id = :id AND c.isActive = true', { id })
          .getOne();
        if (!row) return null;
        return {
          id: row.id,
          name: row.name,
          nit: row.nit,
          address: row.address,
          phone: row.phone,
          isActive: row.isActive,
          employeeCount:
            (row as unknown as { employeeCount: number }).employeeCount ?? 0,
        } satisfies CompanyWithEmployeeCount;
      },
      { companyId: id },
    );
  }

  async listActive(): Promise<CompanyWithEmployeeCount[]> {
    return this.logger.timed(
      'company.repo.listActive',
      async () => {
        const rows = await this.repo
          .createQueryBuilder('c')
          .select([
            'c.id',
            'c.name',
            'c.nit',
            'c.address',
            'c.phone',
            'c.isActive',
          ])
          .loadRelationCountAndMap('c.employeeCount', 'c.employees')
          .where('c.isActive = true')
          .orderBy('c.name', 'ASC')
          .getMany();
        return rows.map<CompanyWithEmployeeCount>((row) => ({
          id: row.id,
          name: row.name,
          nit: row.nit,
          address: row.address,
          phone: row.phone,
          isActive: row.isActive,
          employeeCount:
            (row as unknown as { employeeCount: number }).employeeCount ?? 0,
        }));
      },
      {},
    );
  }
}
