import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { withTransaction } from 'src/shared/utils/transaction.util';
import { DataSource } from 'typeorm';
import {
  KNOWLEDGE_REPOSITORY,
  type KnowledgePort,
} from 'src/resume/repositories/sub-resource.repositories';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from 'src/resume/repositories/resume.repository';
import type { KnowledgeDto } from 'src/resume/dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

@Injectable()
export class ReplaceKnowledgeForApplicantUseCase {
  constructor(
    @Inject(KNOWLEDGE_REPOSITORY)
    private readonly knowledgeRepo: KnowledgePort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly dataSource: DataSource,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    resumeId: number,
    knowledge: KnowledgeDto[],
    user: TokenDto,
  ): Promise<KnowledgeDto[]> {
    return this.logger.timed(
      'knowledge.replaceForApplicant',
      async () => {
        const owned = await this.resumeRepo.validateOwnership({
          resumeId,
          applicantId: user.id,
        });
        if (!owned) throw new NotFoundError('Resume', resumeId);

        // Una sola transaccion: find-or-create + reemplazo del junction.
        await withTransaction(this.dataSource, async () => {
          await this.knowledgeRepo.replaceForResume({
            resumeId,
            knowledge: knowledge.map((k) => ({ id: k.id, name: k.name })),
          });
        });

        const list = await this.knowledgeRepo.listByResume(resumeId);
        return list.map((kn) => ({ id: kn.id, name: kn.name }));
      },
      { resumeId, count: knowledge.length },
    );
  }
}