import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import type { CreateResumeDto } from '../dto/create-resume.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from '../repositories/resume.repository';

/**
 * Use-case: crear un resume.
 */
@Injectable()
export class CreateResumeUseCase {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    input: CreateResumeDto,
    user: TokenDto,
  ): Promise<{ id: number }> {
    return this.logger.timed(
      'resume.create',
      async () => {
        const resume = await this.resumeRepo.insert({
          title: input.title,
          applicantId: user.id,
          creationDate: new Date(),
        });
        return { id: resume.id };
      },
      { applicantId: user.id, title: input.title },
    );
  }
}
