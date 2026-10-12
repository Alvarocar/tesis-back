import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import type { UpdateResumeDto } from '../dto/update-resume.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from '../repositories/resume.repository';

/**
 * Use-case: actualizar el título de un resume (fast path; sin tx porque es 1 update).
 */
@Injectable()
export class UpdateResumeTitleUseCase {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    input: UpdateResumeDto,
    user: TokenDto,
  ): Promise<{ title: string }> {
    return this.logger.timed(
      'resume.updateTitle',
      async () => {
        await this.resumeRepo.update(input.id, user.id, {
          title: input.title,
        });
        return { title: input.title ?? '' };
      },
      { resumeId: input.id, applicantId: user.id },
    );
  }
}
