import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { Role } from 'src/shared/enums/role.enum';
import { VacancyStatus } from 'src/vacancy/enums/vacancy-status.enum';
import {
  VACANCY_REPOSITORY,
  type VacancyRepositoryPort,
} from 'src/vacancy/repositories/vacancy.repository';
import type { JobFilterDto } from '../dto/job-filter.dto';
import type { JobOverviewDto } from '../dto/job-overview.dto';
import type { JobOverviewPublicDto } from '../dto/job-overview-public.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

@Injectable()
export class SearchJobsUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    filters: JobFilterDto,
    user?: TokenDto,
  ): Promise<{
    result: (JobOverviewDto | JobOverviewPublicDto)[];
    totalPages: number;
    currentPage: number;
  }> {
    return this.logger.timed(
      'job.search',
      async () => {
        const page = filters.page ?? 1;
        const pageSize = filters.pageSize ?? 10;
        const status = filters.status ?? VacancyStatus.ENABLE;

        const { data, total } = await this.vacancyRepo.searchPublic(
          { status, text: filters.q },
          { page, pageSize },
        );

        const isPublic =
          !user ||
          user.role === Role.Applicant ||
          (user.role !== Role.Admin &&
            data.some((v) =>
              typeof v === 'number'
                ? false
                : (v as { employeeOwnerId: number }).employeeOwnerId !== user.id,
            ));

        const result: (JobOverviewDto | JobOverviewPublicDto)[] = data.map(
          (v) => {
            const editable =
              !!user &&
              user.role === Role.Admin &&
              v.companyId === user.companyId;

            const base = {
              company: v.companyName || 'UMB',
              id: v.id,
              title: v.title,
              salary: v.salaryOffer ?? 0,
              salaryOffer: v.salaryOffer ?? 0,
              jobType: v.jobType,
              type: v.jobType,
            };

            if (isPublic) {
              return { ...base, editable: false } satisfies JobOverviewPublicDto;
            }
            const ownerEditable =
              !!user &&
              (user.role === Role.Admin ? editable : v.employeeOwnerId === user.id);
            return { ...base, editable: ownerEditable } satisfies JobOverviewDto;
          },
        );

        return {
          result,
          currentPage: page,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
      },
      { hasUser: !!user },
    );
  }
}
