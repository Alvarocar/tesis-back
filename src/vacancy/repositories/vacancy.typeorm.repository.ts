import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VacancyStatus } from 'src/vacancy/enums/vacancy-status.enum';
import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { normalizePagination } from 'src/shared/utils/typeorm-pagination.util';
import {
  type CreateVacancyData,
  type PublicJobSearchCriteria,
  type UpdateVacancyData,
  type VacancyRepositoryPort,
  type VacancySearchCriteria,
} from './vacancy.repository';

/**
 * Adapter TypeORM para `VacancyRepositoryPort`.
 * Encapsula TODAS las queries del feature Vacancy.
 * - `select` explícito (sin over-fetch).
 * - Logging estructurado de cada operación.
 */
@Injectable()
export class VacancyTypeOrmRepository implements VacancyRepositoryPort {
  private readonly logger = new StructuredLogger('VacancyRepository');

  constructor(
    @InjectRepository(Vacancy)
    private readonly repo: Repository<Vacancy>,
  ) {}

  async insert(input: CreateVacancyData): Promise<Vacancy> {
    return this.logger.timed(
      'vacancy.repo.insert',
      async () => {
        const vacancy = this.repo.create({
          title: input.title,
          description: input.description,
          experienceYears: input.experienceYears,
          salaryOffer: input.salaryOffer,
          jobType: input.jobType,
          maxApplicantCount: input.maxApplicantCount,
          status: VacancyStatus.ENABLE,
          creationDate: new Date(),
          modificationDate: new Date(),
          // passthrough relacional: TypeORM resuelve por `{ id: ... }`.
          employee: { id: input.employeeId } as Vacancy['employee'],
        } as unknown as Vacancy);
        await this.repo.insert(vacancy);
        return vacancy;
      },
      { title: input.title, employeeId: input.employeeId },
    );
  }

  async update(id: number, data: UpdateVacancyData): Promise<void> {
    await this.logger.timed(
      'vacancy.repo.update',
      async () => {
        const payload: Record<string, unknown> = {
          modificationDate: new Date(),
        };
        if (data.title !== undefined) payload.title = data.title;
        if (data.description !== undefined)
          payload.description = data.description;
        if (data.experienceYears !== undefined)
          payload.experienceYears = data.experienceYears;
        if (data.salaryOffer !== undefined)
          payload.salaryOffer = data.salaryOffer;
        if (data.jobType !== undefined) payload.jobType = data.jobType;
        if (data.maxApplicantCount !== undefined)
          payload.maxApplicantCount = data.maxApplicantCount;
        if (data.status !== undefined) payload.status = data.status;

        await this.repo.update({ id }, payload);
      },
      { vacancyId: id },
    );
  }

  async archive(id: number): Promise<void> {
    await this.repo.update(id, { status: VacancyStatus.ARCHIVED });
  }

  async findByIdAndCompany(
    id: number,
    companyId: number,
    status: VacancyStatus = VacancyStatus.ENABLE,
  ): Promise<Vacancy | null> {
    return this.logger.timed(
      'vacancy.repo.findByCompany',
      async () => {
        return this.repo
          .createQueryBuilder('vacancy')
          .select([
            'vacancy.id',
            'vacancy.title',
            'vacancy.description',
            'vacancy.experienceYears',
            'vacancy.salaryOffer',
            'vacancy.jobType',
            'vacancy.creationDate',
            'vacancy.modificationDate',
            'vacancy.status',
          ])
          .leftJoin('vacancy.employee', 'employee')
          .addSelect(['employee.id', 'employee.companyId'])
          .where('vacancy.id = :id', { id })
          .andWhere('employee.companyId = :companyId', { companyId })
          .andWhere('vacancy.status = :status', { status })
          .getOne();
      },
      { vacancyId: id, companyId },
    );
  }

  async findByIdWithEmployee(id: number): Promise<Vacancy | null> {
    return this.logger.timed(
      'vacancy.repo.findWithEmployee',
      async () => {
        return this.repo
          .createQueryBuilder('vacancy')
          .select([
            'vacancy.id',
            'vacancy.status',
            'vacancy.title',
            'vacancy.employee',
          ])
          .leftJoin('vacancy.employee', 'employee')
          .addSelect(['employee.id', 'employee.companyId'])
          .where('vacancy.id = :id', { id })
          .getOne();
      },
      { vacancyId: id },
    );
  }

  async existsById(id: number): Promise<boolean> {
    return this.repo.exists({ where: { id } });
  }

  async searchByCriteria(
    criteria: VacancySearchCriteria,
  ): Promise<{ data: Vacancy[]; total: number }> {
    return this.logger.timed(
      'vacancy.repo.search',
      async () => {
        const qb = this.repo
          .createQueryBuilder('vacancy')
          .select([
            'vacancy.id',
            'vacancy.title',
            'vacancy.description',
            'vacancy.experienceYears',
            'vacancy.salaryOffer',
            'vacancy.jobType',
            'vacancy.creationDate',
            'vacancy.modificationDate',
            'vacancy.status',
          ])
          .leftJoin('vacancy.employee', 'employee')
          .addSelect(['employee.id']);

        const { page, pageSize } = normalizePagination();

        if (criteria.employeeId !== undefined) {
          qb.andWhere('employee.id = :employeeId', {
            employeeId: criteria.employeeId,
          });
        }
        if (criteria.status !== undefined) {
          qb.andWhere('vacancy.status = :status', { status: criteria.status });
        }
        if (criteria.statusIn?.length) {
          qb.andWhere('vacancy.status IN (:...statuses)', {
            statuses: criteria.statusIn,
          });
        }
        if (criteria.text && criteria.text.trim().length > 0) {
          const term = `%${criteria.text.trim()}%`;
          // Sub-search OR; evitamos hack de `expressionMap.wheres`.
          qb.andWhere(
            '(vacancy.title ILIKE :term OR vacancy.description ILIKE :term)',
            { term },
          );
        }

        qb.orderBy('vacancy.modificationDate', 'DESC')
          .take(pageSize)
          .skip((page - 1) * pageSize);

        const [data, total] = await qb.getManyAndCount();
        return { data, total };
      },
      { criteria },
    );
  }

  async searchPublic(
    criteria: PublicJobSearchCriteria,
    pagination: { page: number; pageSize: number },
  ): Promise<{
    data: Array<{
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
    }>;
    total: number;
  }> {
    return this.logger.timed(
      'vacancy.repo.searchPublic',
      async () => {
        const { page, pageSize } = normalizePagination(pagination);

        const base = (status: VacancyStatus) =>
          this.repo
            .createQueryBuilder('vacancy')
            .leftJoin('vacancy.employee', 'employee')
            .leftJoin('employee.company', 'company')
            .where('vacancy.status = :status', { status })
            .orderBy('vacancy.modificationDate', 'DESC')
            .take(pageSize)
            .skip((page - 1) * pageSize);
        const text = criteria.text?.trim();
        const status = criteria.status ?? VacancyStatus.ENABLE;
        const qb = base(status);
        if (text && text.length > 0) {
          const term = `%${text}%`;
          qb.andWhere(
            '(vacancy.title ILIKE :term OR vacancy.description ILIKE :term)',
            { term },
          );
        }

        const [rows, total] = await Promise.all([
          qb.getRawMany<{
            vacancy_id: number;
            vacancy_title: string;
            vacancy_description: string;
            vacancy_experience_years: number | null;
            vacancy_salary_offer: number | null;
            vacancy_job_type: string;
            vacancy_creation_date: Date;
            vacancy_modification_date: Date;
            vacancy_status: VacancyStatus;
            employee_id: number;
            employee_companyId: number;
            company_id: number;
            company_name: string;
          }>(),
          this.repo.count({ where: { status } }),
        ]);

        const data = rows.map((r) => ({
          id: r.vacancy_id,
          title: r.vacancy_title,
          description: r.vacancy_description,
          experienceYears: r.vacancy_experience_years,
          salaryOffer: r.vacancy_salary_offer,
          jobType: r.vacancy_job_type as Vacancy['jobType'],
          creationDate: r.vacancy_creation_date,
          modificationDate: r.vacancy_modification_date,
          status: r.vacancy_status,
          companyId: r.company_id,
          companyName: r.company_name,
          employeeOwnerId: r.employee_id,
        }));

        return { data, total };
      },
      { criteria },
    );
  }

  async countByStatus(status: VacancyStatus): Promise<number> {
    return this.repo.count({ where: { status } });
  }
}
