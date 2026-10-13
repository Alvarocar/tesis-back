import { Injectable } from '@nestjs/common';
import type { SkillDto } from 'src/resume/dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import { ReplaceSkillsForApplicantUseCase } from './use-cases/replace-skills.use-case';

@Injectable()
export class SkillService {
  constructor(private readonly replaceUc: ReplaceSkillsForApplicantUseCase) {}

  createOrUpdateSkillsForApplicant(
    resumeId: number,
    skills: SkillDto[],
    user: TokenDto,
  ) {
    return this.replaceUc.execute(resumeId, skills, user);
  }
}
