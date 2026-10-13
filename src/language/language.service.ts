import { Injectable } from '@nestjs/common';
import type { LanguageDto } from 'src/resume/dto/resume-detail.dto';
import type { LanguageOverviewDto } from './dto/language-overview.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  ListAllLanguagesUseCase,
  ListLanguagesByResumeUseCase,
  SearchLanguagesUseCase,
} from './use-cases/find-languages.use-case';
import { ReplaceLanguagesForApplicantUseCase } from './use-cases/replace-languages.use-case';

@Injectable()
export class LanguageService {
  constructor(
    private readonly searchUc: SearchLanguagesUseCase,
    private readonly listAllUc: ListAllLanguagesUseCase,
    private readonly listByResumeUc: ListLanguagesByResumeUseCase,
    private readonly replaceUc: ReplaceLanguagesForApplicantUseCase,
  ) {}

  search(term: string): Promise<LanguageOverviewDto[]> {
    return this.searchUc.execute(term);
  }
  getAll(): Promise<LanguageOverviewDto[]> {
    return this.listAllUc.execute();
  }
  getByResume(resumeId: number): Promise<LanguageDto[]> {
    return this.listByResumeUc.execute(resumeId, {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      role: 'applicant' as never,
    });
  }
  createOrUpdateForApplicant(
    resumeId: number,
    languages: LanguageDto[],
    user: TokenDto,
  ) {
    return this.replaceUc.execute(resumeId, languages, user);
  }
}
