import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  VACANCY_REPOSITORY,
  type VacancyRepositoryPort,
} from 'src/vacancy/repositories/vacancy.repository';
import { VacancyStatus } from 'src/vacancy/enums/vacancy-status.enum';
import { DateUtil } from 'src/shared/utils/date.util';
import { isJobEditable } from './job-editable.policy';
import type { JobDetailDto } from '../dto/job-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

/**
 * Job detail público para /v1/job/:id.
 *
 * Reglas:
 * - Si la vacante está archivada (ARCHIVED), solo un usuario autenticado de
 *   la MISMA empresa puede verla.
 * - Para usuarios autenticados, `editable` es true solo si son admin de la
 *   misma empresa o si son el empleado dueño (regla compartida por
 *   `isJobEditable` para garantizar consistencia con el listado).
 * - Para visitantes anónimos o applicants, editable siempre es false.
 */
@Injectable()
export class FindJobDetailUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(id: number, user?: TokenDto): Promise<JobDetailDto> {
    return this.logger.timed(
      'job.detail',
      async () => {
        const row = await this.vacancyRepo.findDetailById(id);
        if (!row) {
          throw new NotFoundError('Job', { jobId: id });
        }

        if (row.status === VacancyStatus.ARCHIVED) {
          const belongsToSameCompany =
            !!user &&
            row.companyId !== null &&
            user.companyId === row.companyId;

          // Política para archivadas:
          // - misma empresa + autenticado -> visible
          // - cualquier otro caso -> 404 (no filtrar existencia)
          if (!belongsToSameCompany) {
            throw new NotFoundError('Job', { jobId: id, status: row.status });
          }
        }

        const editable = isJobEditable(user, {
          employeeOwnerId: row.employeeOwnerId,
          companyId: row.companyId,
        });

        return {
          id: row.id,
          title: row.title,
          description: row.description,
          experienceYears: row.experienceYears ?? 0,
          salaryOffer: row.salaryOffer ?? 0,
          modificationDate: DateUtil.toString(row.modificationDate),
          jobType: row.jobType,
          company: row.companyName ?? 'UMB',
          editable,
        } satisfies JobDetailDto;
      },
      { jobId: id, hasUser: !!user },
    );
  }
}
