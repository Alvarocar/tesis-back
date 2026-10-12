import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { withTransaction } from 'src/shared/utils/transaction.util';
import { DataSource } from 'typeorm';
import {
  LANGUAGE_REPOSITORY,
  type LanguagePort,
} from 'src/resume/repositories/sub-resource.repositories';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from 'src/resume/repositories/resume.repository';
import type { LanguageDto } from 'src/resume/dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

@Injectable()
export class ReplaceLanguagesForApplicantUseCase {
  constructor(
    @Inject(LANGUAGE_REPOSITORY)
    private readonly languageRepo: LanguagePort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly dataSource: DataSource,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    resumeId: number,
    languages: LanguageDto[],
    user: TokenDto,
  ): Promise<{ id: number; name: string; level: number }[]> {
    return this.logger.timed(
      'language.replaceForApplicant',
      async () => {
        const owned = await this.resumeRepo.validateOwnership({
          resumeId,
          applicantId: user.id,
        });
        if (!owned) throw new NotFoundError('Resume', resumeId);

        // El find-or-create + clear + insert se hace adentro del replace.
        // Llevarlo a una transacción de BD da más garantías ante fallos.
        await withTransaction(this.dataSource, async () => {
          await this.languageRepo.replaceForResume({
            resumeId,
            languages: languages.map((l) => ({
              id: l.id,
              name: l.name,
              level: l.level,
            })),
          });
        });

        return this.languageRepo.listByResume(resumeId);
      },
      { resumeId, count: languages.length },
    );
  }
}
