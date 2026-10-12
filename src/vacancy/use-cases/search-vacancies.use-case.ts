import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { Role } from 'src/shared/enums/role.enum';
import { VacancyStatus } from '../enums/vacancy-status.enum';
import type { VacancyFilterDto } from '../dto/vacancy-filter.dto';
import type { JobOverviewDto } from 'src/job/dto/job-overview.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  type VacancyRepositoryPort,
  VACANCY_REPOSITORY,
} from '../repositories/vacancy.repository';

/**
 * Use-case: buscar vacantes con paginación y filtros.
 * - Si el usuario es Admin/Employee, ve sus propias vacantes (employeeId = user.id).
 * - Si el usuario es Applicant, devuelve lista vacía (no le aplica).
 */
@Injectable()
export class SearchVacanciesUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    filters: VacancyFilterDto,
    user: TokenDto,
  ): Promise<{
    data: JobOverviewDto[];
    currentPage: number;
    totalPages: number;
  }> {
    return this.logger.timed(
      'vacancy.search',
      async () => {
        const page = filters.page ?? 1;
        const pageSize = filters.pageSize ?? 10;
        const status = filters.statusFilter ?? VacancyStatus.ENABLE;

        const { data, total } = await this.vacancyRepo.searchByCriteria({
          employeeId: user.id,
          status,
          text: filters.q,
        });

        const result = data.map<JobOverviewDto>((vacancy) => ({
          id: vacancy.id,
          title: vacancy.title,
          salary: vacancy.salaryOffer ?? 0,
          salaryOffer: vacancy.salaryOffer ?? 0,
          type: vacancy.jobType,
          jobType: vacancy.jobType,
          company: 'UMB',
          editable:
            user.role === Role.Admin ||
            (typeof vacancy.employee === 'number'
              ? vacancy.employee
              : (vacancy.employee as { id: number }).id) === user.id,
        }));

        return {
          data: result,
          currentPage: page,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
      },
      { userId: user.id, status: filters.statusFilter ?? VacancyStatus.ENABLE },
    );
  }
}
