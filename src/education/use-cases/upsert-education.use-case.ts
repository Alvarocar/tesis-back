import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { DateUtil } from 'src/shared/utils/date.util';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from 'src/resume/repositories/resume.repository';
import {
  EDUCATION_REPOSITORY,
  type EducationPort,
} from 'src/resume/repositories/sub-resource.repositories';
import type { EducationDto } from 'src/resume/dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

@Injectable()
export class UpsertEducationUseCase {
  constructor(
    @Inject(EDUCATION_REPOSITORY)
    private readonly educationRepo: EducationPort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    resumeId: number,
    input: EducationDto,
    user: TokenDto,
  ): Promise<EducationDto> {
    return this.logger.timed(
      'education.upsert',
      async () => {
        const owned = await this.resumeRepo.validateOwnership({
          resumeId,
          applicantId: user.id,
        });
        if (!owned) throw new NotFoundError('Resume', resumeId);

        const entity = await this.educationRepo.upsert({
          id: input.id,
          resumeId,
          institute: input.institute,
          title: input.title,
          startDate: DateUtil.toDate(input.startDate),
          endDate: input.endDate ? DateUtil.toDate(input.endDate) : null,
          keepStudy: input.keepStudy,
        });

        return {
          id: entity.id,
          institute: entity.institute,
          title: entity.title,
          startDate: DateUtil.toString(entity.startDate),
          endDate: entity.endDate
            ? DateUtil.toString(entity.endDate)
            : undefined,
          keepStudy: entity.keepStudy ?? false,
        } satisfies EducationDto;
      },
      { resumeId, educationId: input.id },
    );
  }
}
