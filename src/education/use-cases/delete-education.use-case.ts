import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from 'src/resume/repositories/resume.repository';
import {
  EDUCATION_REPOSITORY,
  type EducationPort,
} from 'src/resume/repositories/sub-resource.repositories';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

@Injectable()
export class DeleteEducationUseCase {
  constructor(
    @Inject(EDUCATION_REPOSITORY)
    private readonly educationRepo: EducationPort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    resumeId: number,
    educationId: number,
    user: TokenDto,
  ): Promise<void> {
    return this.logger.timed(
      'education.delete',
      async () => {
        const owned = await this.resumeRepo.validateOwnership({
          resumeId,
          applicantId: user.id,
        });
        if (!owned) throw new NotFoundError('Resume', resumeId);

        const deleted = await this.educationRepo.deleteOwned({
          resumeId,
          educationId,
        });
        if (!deleted) throw new NotFoundError('Education', educationId);
      },
      { resumeId, educationId },
    );
  }
}
