import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  VACANCY_REPOSITORY,
  type VacancyRepositoryPort,
} from 'src/vacancy/repositories/vacancy.repository';
import { VacancyStatus } from 'src/vacancy/enums/vacancy-status.enum';
import { DateUtil } from 'src/shared/utils/date.util';
import type { JobDetailDto } from '../dto/job-detail.dto';

@Injectable()
export class FindJobDetailUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(id: number): Promise<JobDetailDto> {
    return this.logger.timed(
      'job.detail',
      async () => {
        const vacancy = await this.vacancyRepo.findByIdAndCompany(
          id,
          -1, // se ignora dentro del repo
          VacancyStatus.ENABLE,
        );
        // Si no encuentra en ese modo, probamos con cualquier status (público):
        const v =
          vacancy ??
          (await this.vacancyRepo.findByIdWithEmployee(id));
        if (!v) throw new NotFoundError('Job', { jobId: id });

        return {
          id: v.id,
          title: v.title,
          description: v.description,
          experienceYears: v.experienceYears ?? 0,
          salaryOffer: v.salaryOffer ?? 0,
          modificationDate: DateUtil.toString(v.modificationDate),
          jobType: v.jobType,
        } satisfies JobDetailDto;
      },
      { jobId: id },
    );
  }
}
