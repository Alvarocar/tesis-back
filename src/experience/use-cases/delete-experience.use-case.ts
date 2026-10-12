import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from 'src/resume/repositories/resume.repository';
import {
  EXPERIENCE_REPOSITORY,
  type ExperiencePort,
} from 'src/resume/repositories/sub-resource.repositories';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

@Injectable()
export class DeleteExperienceUseCase {
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepo: ExperiencePort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    resumeId: number,
    experienceId: number,
    user: TokenDto,
  ): Promise<void> {
    return this.logger.timed(
      'experience.delete',
      async () => {
        const owned = await this.resumeRepo.validateOwnership({
          resumeId,
          applicantId: user.id,
        });
        if (!owned) throw new NotFoundError('Resume', resumeId);

        const deleted = await this.experienceRepo.deleteOwned({
          resumeId,
          experienceId,
        });
        if (!deleted) throw new NotFoundError('Experience', experienceId);
      },
      { resumeId, experienceId },
    );
  }
}
