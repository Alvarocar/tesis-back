import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ForbiddenError } from 'src/shared/errors/domain.error';
import { Role } from 'src/shared/enums/role.enum';
import { VacancyStatus } from '../enums/vacancy-status.enum';
import type { JobOverviewDto } from 'src/job/dto/job-overview.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  type VacancyRepositoryPort,
  VACANCY_REPOSITORY,
} from '../repositories/vacancy.repository';
import {
  normalizePagination,
  paginate,
  type Paginated,
} from 'src/shared/utils/typeorm-pagination.util';
import type { Vacancy } from '../entities/vacancy.entity';

/**
 * Use-case: listar vacantes en COMPLETED/ARCHIVED (autorización interna).
 */
@Injectable()
export class FindCompletedAndArchivedUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    pagination: { page: number; pageSize: number },
    user: TokenDto,
  ): Promise<{
    data: JobOverviewDto[];
    currentPage: number;
    totalPages: number;
  }> {
    if (user.role !== Role.Employee && user.role !== Role.Admin) {
      throw new ForbiddenError('Acceso denegado');
    }

    return this.logger.timed(
      'vacancy.findCompletedAndArchived',
      async () => {
        const { data, total } = await this.vacancyRepo.searchByCriteria({
          employeeId: user.id,
          statusIn: [VacancyStatus.COMPLETED, VacancyStatus.ARCHIVED],
        });

        const mapped = data.map<JobOverviewDto>((v: Vacancy) => ({
          id: v.id,
          title: v.title,
          salary: v.salaryOffer ?? 0,
          salaryOffer: v.salaryOffer ?? 0,
          type: v.jobType,
          jobType: v.jobType,
          status: v.status,
          company: 'UMB',
          editable:
            user.id ===
              (typeof v.employee === 'number'
                ? v.employee
                : (v.employee as { id: number }).id) ||
            user.role === Role.Admin,
        }));

        // Pieza compatible con el controlador actual (`currentPage`/`totalPages`).
        const { page, pageSize } = normalizePagination(pagination);
        return {
          data: mapped,
          currentPage: page,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
      },
      { userId: user.id },
    );
  }
}
