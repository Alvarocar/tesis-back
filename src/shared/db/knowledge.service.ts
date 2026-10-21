import { Injectable } from '@nestjs/common';
import type { KnowledgeDto } from 'src/resume/dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import { ReplaceKnowledgeForApplicantUseCase } from './use-cases/replace-knowledge.use-case';

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly replaceUc: ReplaceKnowledgeForApplicantUseCase,
  ) {}

  createOrUpdateForApplicant(
    resumeId: number,
    knowledge: KnowledgeDto[],
    user: TokenDto,
  ) {
    return this.replaceUc.execute(resumeId, knowledge, user);
  }
}
