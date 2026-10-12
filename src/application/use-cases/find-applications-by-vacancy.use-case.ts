import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ForbiddenError } from 'src/shared/errors/domain.error';
import { DateUtil } from 'src/shared/utils/date.util';
import { Role } from 'src/shared/enums/role.enum';
import { normalizePagination } from 'src/shared/utils/typeorm-pagination.util';
import type { ApplicationFilterDto } from '../dto/application-filter.dto';
import type { ApplicationOverviewDto } from '../dto/application-overview.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  APPLICATION_REPOSITORY,
  type ApplicationRepositoryPort,
} from '../repositories/application.repository';
import {
  VACANCY_REPOSITORY,
  type VacancyRepositoryPort,
} from 'src/vacancy/repositories/vacancy.repository';

/**
 * Use-case: obtener listado de applications por vacancy con paginación.
 * - Verifica que la vacante pertenece al tenant (companyId) del user (no Admin).
 */
@Injectable()
export class FindApplicationsByVacancyUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepo: ApplicationRepositoryPort,
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    filters: ApplicationFilterDto,
    vacancyId: number,
    user: TokenDto,
  ): Promise<{
    result: ApplicationOverviewDto[];
    currentPage: number;
    totalPages: number;
  }> {
    return this.logger.timed(
      'application.listByVacancy',
      async () => {
        const vacancy = await this.vacancyRepo.findByIdWithEmployee(vacancyId);
        if (!vacancy) {
          // Devolvemos vacío en lugar de tirar excepción; el caller puede
          // querer ver "no hay aplicaciones" sin distinguir el motivo.
          return { result: [], currentPage: filters.page ?? 1, totalPages: 1 };
        }

        const employee = vacancy.employee as { companyId: number };
        if (user.role !== Role.Admin && employee.companyId !== user.companyId) {
          throw new ForbiddenError('La vacante no pertenece a su empresa', {
            userId: user.id,
            vacancyId,
          });
        }

        const { page, pageSize } = normalizePagination(filters);
        const { data, total } = await this.applicationRepo.searchByVacancy(
          vacancyId,
          { page, pageSize },
        );

        const result: ApplicationOverviewDto[] = (
          data as unknown as Array<{
            id: number;
            status: typeof EApplicationStatus;
            feedBack: string | null;
            affinity: number | null;
            creationDate: Date;
            resume: {
              id: number;
              applicant: { id: number; firstName: string; lastName: string };
            };
          }>
        ).map((a) => ({
          id: a.id,
          status: a.status as unknown as never,
          feedBack: a.feedBack ?? '',
          affinity: a.affinity ?? 0,
          creationDate: DateUtil.toString(a.creationDate),
          resume: { id: a.resume.id },
          applicant: {
            id: a.resume.applicant.id,
            firstName: a.resume.applicant.firstName,
            lastName: a.resume.applicant.lastName,
          },
        }));

        return {
          result,
          currentPage: page,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
      },
      { vacancyId, userId: user.id },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EApplicationStatus = {} as never;
