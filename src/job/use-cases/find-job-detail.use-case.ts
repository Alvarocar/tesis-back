import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError, ForbiddenError } from 'src/shared/errors/domain.error';
import {
  VACANCY_REPOSITORY,
  type VacancyRepositoryPort,
} from 'src/vacancy/repositories/vacancy.repository';
import { Role } from 'src/shared/enums/role.enum';
import { VacancyStatus } from 'src/vacancy/enums/vacancy-status.enum';
import { DateUtil } from 'src/shared/utils/date.util';
import type { JobDetailDto } from '../dto/job-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

/**
 * Job detail público para /v1/job/:id.
 *
 * Reglas:
 * - Si la vacante está archivada (ARCHIVED), solo Admin puede verla.
 * - Para usuarios autenticados, `editable` es true solo si son admin de la
 *   misma empresa o si son el empleado dueño.
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

        // Bloqueo para vacantes archivadas: solo Admin las ve.
        if (
          row.status === VacancyStatus.ARCHIVED &&
          (!user || user.role !== Role.Admin)
        ) {
          throw new ForbiddenError(
            'Esta vacante ya no está disponible',
            { vacancyId: id, status: row.status },
          );
        }

        const editable = this.computeEditable(row.employeeOwnerId, row.companyId, user);

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

  private computeEditable(
    employeeOwnerId: number,
    companyId: number | null,
    user?: TokenDto,
  ): boolean {
    if (!user) return false;
    if (user.role === Role.Applicant) return false;
    if (user.role === Role.Admin) {
      return companyId !== null && user.companyId === companyId;
    }
    // Employee: dueño de la vacante.
    return user.id === employeeOwnerId;
  }
}
