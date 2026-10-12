import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import type { UpdateAboutMeDto } from '../dto/update-about-me-resume.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from '../repositories/resume.repository';

/**
 * Use-case: actualizar el "about me" del resume.
 */
@Injectable()
export class UpdateResumeAboutMeUseCase {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    input: UpdateAboutMeDto,
    user: TokenDto,
  ): Promise<{ aboutMe: string }> {
    return this.logger.timed(
      'resume.updateAboutMe',
      async () => {
        await this.resumeRepo.update(input.resumeId, user.id, {
          aboutMe: input.aboutMe,
        });
        return { aboutMe: input.aboutMe };
      },
      { resumeId: input.resumeId, applicantId: user.id },
    );
  }
}
