import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
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

/**
 * Use-case: validar que (resume, vacancy) estén listos para aplicar y devolver
 * la application existente si la hay.
 *
 * Importante: se ejecuta en paralelo (Promise.all) para no multiplicar RTT.
 */
@Injectable()
export class WasApplicationDoneUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepo: ApplicationRepositoryPort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(input: {
    vacancyId: number;
    resumeId: number;
    user: TokenDto;
  }): Promise<{
    application: null | { id: number };
    resume: null | { id: number; title: string };
    vacancy: null | { id: number };
  }> {
    return this.logger.timed(
      'application.wasDone',
      async () => {
        const { vacancyId, resumeId, user } = input;
        const [resume, vacancy] = await Promise.all([
          this.resumeRepo.findDetailByIdAndApplicant(resumeId, user.id),
          this.vacancyRepo.existsById(vacancyId),
        ]);
        if (!resume) {
          throw new NotFoundError(
            'Resume no encontrado para este applicant',
            resumeId,
          );
        }
        if (!vacancy) throw new NotFoundError('Vacancy', vacancyId);
        const exists = await this.applicationRepo.existsForResumeAndVacancy(
          resumeId,
          vacancyId,
        );
        return {
          application: exists ? { id: 1 } : null,
          resume: { id: resume.id, title: resume.title },
          vacancy: { id: vacancyId },
        };
      },
      { vacancyId: input.vacancyId, resumeId: input.resumeId },
    );
  }
}
