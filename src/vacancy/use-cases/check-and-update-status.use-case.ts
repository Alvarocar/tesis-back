import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { VacancyStatus } from '../enums/vacancy-status.enum';
import type { Vacancy } from '../entities/vacancy.entity';
import {
  type VacancyRepositoryPort,
  VACANCY_REPOSITORY,
} from '../repositories/vacancy.repository';

/**
 * Use-case: marcar una vacante como COMPLETED si se alcanzó el
 * `maxApplicantCount`. Lo usa `ApplicationListener` tras una nueva postulación.
 *
 * Arranco definiendo la unidad de trabajo para que el listener la invoque;
 * la firma acepta una entidad ya cargada para evitar un SELECT extra.
 */
@Injectable()
export class CheckAndUpdateVacancyStatusUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(vacancy: {
    id: number;
    maxApplicantCount: number | null;
    applicationsCount: number;
  }): Promise<void> {
    if (
      vacancy.maxApplicantCount === null ||
      vacancy.maxApplicantCount === undefined ||
      vacancy.applicationsCount < vacancy.maxApplicantCount
    ) {
      return;
    }

    await this.logger.timed(
      'vacancy.checkAndUpdateStatus',
      async () => {
        await this.vacancyRepo.update(vacancy.id, {
          status: VacancyStatus.COMPLETED,
        });
      },
      { vacancyId: vacancy.id, count: vacancy.applicationsCount },
    );
  }
}
