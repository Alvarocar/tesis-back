import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { withTransaction } from 'src/shared/utils/transaction.util';
import { DataSource } from 'typeorm';
import {
  SKILL_REPOSITORY,
  type SkillPort,
} from 'src/resume/repositories/sub-resource.repositories';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from 'src/resume/repositories/resume.repository';
import type { SkillDto } from 'src/resume/dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

@Injectable()
export class ReplaceSkillsForApplicantUseCase {
  constructor(
    @Inject(SKILL_REPOSITORY)
    private readonly skillRepo: SkillPort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly dataSource: DataSource,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    resumeId: number,
    skills: SkillDto[],
    user: TokenDto,
  ): Promise<{ id: number; name: string }[]> {
    return this.logger.timed('skill.replaceForApplicant', async () => {
      const owned = await this.resumeRepo.validateOwnership({
        resumeId,
        applicantId: user.id,
      });
      if (!owned) throw new NotFoundError('Resume', resumeId);

      // Una sola transacción: find-or-create skills + reset resume_skill + insert.
      await withTransaction(this.dataSource, async () => {
        await this.skillRepo.replaceForResume({
          resumeId,
          skills: skills.map((s) => ({ id: s.id, name: s.name })),
        });
      });

      const list = await this.skillRepo.listByResume(resumeId);
      return list.map((sk) => ({ id: sk.id, name: sk.name }));
    });
  }
}
