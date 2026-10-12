import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { DateUtil } from 'src/shared/utils/date.util';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from 'src/resume/repositories/resume.repository';
import {
  EXPERIENCE_REPOSITORY,
  type ExperiencePort,
} from 'src/resume/repositories/sub-resource.repositories';
import type { ExperienceDto } from 'src/resume/dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

@Injectable()
export class UpsertExperienceUseCase {
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepo: ExperiencePort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    resumeId: number,
    input: ExperienceDto,
    user: TokenDto,
  ): Promise<ExperienceDto> {
    return this.logger.timed(
      'experience.upsert',
      async () => {
        const owned = await this.resumeRepo.validateOwnership({
          resumeId,
          applicantId: user.id,
        });
        if (!owned) throw new NotFoundError('Resume', resumeId);

        const entity = await this.experienceRepo.upsert({
          id: input.id,
          resumeId,
          company: input.company,
          rol: input.rol,
          description: input.description,
          startDate: DateUtil.toDate(input.startDate),
          endDate: input.endDate ? DateUtil.toDate(input.endDate) : null,
          keepWorking: input.keepWorking,
        });

        return {
          id: entity.id,
          company: entity.company,
          startDate: DateUtil.toString(entity.startDate),
          endDate: entity.endDate ? DateUtil.toString(entity.endDate) : undefined,
          description: entity.description,
          keepWorking: entity.keepWorking ?? false,
          rol: entity.rol,
        } satisfies ExperienceDto;
      },
      { resumeId, experienceId: input.id },
    );
  }
}
