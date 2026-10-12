import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError, ConflictError } from 'src/shared/errors/domain.error';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EApplicationStatus } from 'src/shared/enums/application-status.enum';
import {
  APPLICATION_REPOSITORY,
  type ApplicationRepositoryPort,
} from '../repositories/application.repository';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from 'src/resume/repositories/resume.repository';
import {
  VACANCY_REPOSITORY,
  type VacancyRepositoryPort,
} from 'src/vacancy/repositories/vacancy.repository';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

export interface ApplyUseCaseInput {
  vacancyId: number;
  resumeId: number;
  user: TokenDto;
}

/**
 * Use-case: aplicar a una vacante.
 *
 * Pasos:
 * 1. Validar existencia del resume (ownership) y la vacante.
 * 2. Verificar que NO exista ya una application para (resumeId, vacancyId).
 * 3. Insertar application con status APPLIED.
 * 4. Emitir evento `application.applied` (listener dispara análisis IA).
 *
 * `checkAndUpdateStatus` se delega al legacy facade hasta migrar el listener.
 */
@Injectable()
export class ApplyUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepo: ApplicationRepositoryPort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(input: ApplyUseCaseInput): Promise<{ applicationId: number }> {
    return this.logger.timed(
      'application.apply',
      async () => {
        const { vacancyId, resumeId, user } = input;
        const [resume, vacancy] = await Promise.all([
          this.resumeRepo.findDetailByIdAndApplicant(resumeId, user.id),
          this.vacancyRepo.findByIdWithEmployee(vacancyId),
        ]);
        if (!resume) throw new NotFoundError('Resume', resumeId);
        if (!vacancy) throw new NotFoundError('Vacancy', vacancyId);

        const alreadyApplied =
          await this.applicationRepo.existsForResumeAndVacancy(
            resumeId,
            vacancyId,
          );
        if (alreadyApplied) {
          throw new ConflictError(
            'Ya existe una aplicación para este resume y vacante',
            { resumeId, vacancyId },
          );
        }

        const created = await this.applicationRepo.insert({
          resumeId,
          vacancyId,
          status: EApplicationStatus.APPLIED,
          creationDate: new Date(),
        });

        this.eventEmitter.emit('application.applied', {
          applicationId: created.id,
          vacantId: vacancyId,
          resumeId,
        });

        return { applicationId: created.id };
      },
      {
        vacancyId: input.vacancyId,
        resumeId: input.resumeId,
        userId: input.user.id,
      },
    );
  }
}
