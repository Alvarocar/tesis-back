import { Injectable } from '@nestjs/common';
import { CheckAndUpdateVacancyStatusUseCase } from './use-cases/check-and-update-status.use-case';

/**
 * Legacy facade: mantiene compatibilidad con consumers externos
 * (`ApplicationService.checkAndUpdateStatus`). Internamente delega en
 * el use-case. Se conservará hasta migrar `ApplicationModule` al nuevo
 * patrón, momento en el cual este facade se borrará.
 */
@Injectable()
export class VacancyService {
  constructor(
    private readonly checkAndUpdateStatusUc: CheckAndUpdateVacancyStatusUseCase,
  ) {}

  async checkAndUpdateStatus(vacancy: {
    id: number;
    maxApplicantCount: number | null;
    applications: { length: number };
  }): Promise<void> {
    await this.checkAndUpdateStatusUc.execute({
      id: vacancy.id,
      maxApplicantCount: vacancy.maxApplicantCount,
      applicationsCount: vacancy.applications.length,
    });
  }
}
