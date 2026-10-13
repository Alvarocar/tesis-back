import { Injectable } from '@nestjs/common';
import type { JobFilterDto } from './dto/job-filter.dto';
import type { JobOverviewDto } from './dto/job-overview.dto';
import type { JobOverviewPublicDto } from './dto/job-overview-public.dto';
import type { JobDetailDto } from './dto/job-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import { SearchJobsUseCase } from './use-cases/search-jobs.use-case';
import { FindJobDetailUseCase } from './use-cases/find-job-detail.use-case';
import { CheckJobAppliedUseCase } from './use-cases/check-job-applied.use-case';

/**
 * Legacy facade: delega en use-cases.
 *
 * El controller `findAll` envuelve el resultado con `ParsingUtil.paginate`
 * por compat. Los métodos sencillos delegan 1 a 1.
 */
@Injectable()
export class JobService {
  constructor(
    private readonly searchUc: SearchJobsUseCase,
    private readonly detailUc: FindJobDetailUseCase,
    private readonly appliedUc: CheckJobAppliedUseCase,
  ) {}

  async findAll(
    filter: JobFilterDto,
    user?: TokenDto,
  ): Promise<{
    result: (JobOverviewDto | JobOverviewPublicDto)[];
    totalPages: number;
    currentPage: number;
  }> {
    return this.searchUc.execute(filter, user);
  }

  findOne(id: number): Promise<JobDetailDto> {
    return this.detailUc.execute(id);
  }

  isApplied(user: TokenDto, vacancyId: number): Promise<boolean> {
    return this.appliedUc.execute(user, vacancyId);
  }
}
