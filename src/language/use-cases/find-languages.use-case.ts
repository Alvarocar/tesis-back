import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  LANGUAGE_REPOSITORY,
  type LanguagePort,
} from 'src/resume/repositories/sub-resource.repositories';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from 'src/resume/repositories/resume.repository';
import type { LanguageDto } from 'src/resume/dto/resume-detail.dto';
import type { LanguageOverviewDto } from '../dto/language-overview.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

/**
 * Use-cases para LanguageService (read-mostly: search + listByResume).
 * El reemplazo (`replaceForApplicant`) está en replace-languages.use-case.ts.
 */
@Injectable()
export class SearchLanguagesUseCase {
  constructor(
    @Inject(LANGUAGE_REPOSITORY)
    private readonly languageRepo: LanguagePort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(term: string): Promise<LanguageOverviewDto[]> {
    return this.logger.timed('language.search', async () => {
      if (!term || !term.trim()) return [];
      const rows = await this.languageRepo.searchByTerm(term.trim());
      return rows.map((l) => ({ id: l.id, name: l.name }));
    });
  }
}

@Injectable()
export class ListAllLanguagesUseCase {
  constructor(
    @Inject(LANGUAGE_REPOSITORY)
    private readonly languageRepo: LanguagePort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(): Promise<LanguageOverviewDto[]> {
    return this.logger.timed('language.listAll', async () => {
      const rows = await this.languageRepo.listAll();
      return rows.map((l) => ({ id: l.id, name: l.name }));
    });
  }
}

@Injectable()
export class ListLanguagesByResumeUseCase {
  constructor(
    @Inject(LANGUAGE_REPOSITORY)
    private readonly languageRepo: LanguagePort,
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(resumeId: number, user: TokenDto): Promise<LanguageDto[]> {
    return this.logger.timed('language.listByResume', async () => {
      const owned = await this.resumeRepo.validateOwnership({
        resumeId,
        applicantId: user.id,
      });
      if (!owned) throw new NotFoundError('Resume', resumeId);
      return this.languageRepo.listByResume(resumeId);
    });
  }
}
