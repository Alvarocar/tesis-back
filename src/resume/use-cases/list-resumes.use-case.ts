import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from '../repositories/resume.repository';
import type { OverviewResumeDto } from '../dto/overview-resume.dto';

/**
 * Use-case: listar resumes del applicant.
 */
@Injectable()
export class ListResumesUseCase {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(user: TokenDto): Promise<OverviewResumeDto[]> {
    return this.logger.timed(
      'resume.listOverview',
      async () => {
        const rows = await this.resumeRepo.listOverviewByApplicant(user.id);
        return rows.map<OverviewResumeDto>((r) => ({
          id: r.id,
          title: r.title,
          aboutMe: r.aboutMe,
        }));
      },
      { applicantId: user.id },
    );
  }
}
