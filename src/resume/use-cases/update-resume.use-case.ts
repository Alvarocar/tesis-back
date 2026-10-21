import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import type { UpdateResumeDto } from '../dto/update-resume.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from '../repositories/resume.repository';

/**
 * Use-case: actualizar los campos escalares de un resume (titulo y
 * modalidad de trabajo). Es el handler de `PATCH /v1/resume`.
 *
 * Arma el patch solo con los campos presentes: `repo.update` recibe el
 * objeto tal cual, asi que mandar `undefined` explicito lo haria un SET
 * a NULL en vez de "no tocar este campo".
 */
@Injectable()
export class UpdateResumeUseCase {
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
      'resume.update',
      async () => {
        const patch: {
          title?: string;
          workModality?: UpdateResumeDto['workModality'];
        } = {};

        if (input.title !== undefined) patch.title = input.title;
        if (input.workModality !== undefined) {
          patch.workModality = input.workModality;
        }

        await this.resumeRepo.update(input.id, user.id, patch);
        return { title: input.title ?? '' };
      },
      { resumeId: input.id, applicantId: user.id },
    );
  }
}
