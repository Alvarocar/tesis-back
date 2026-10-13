import { Injectable } from '@nestjs/common';
import type { ExperienceDto } from 'src/resume/dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import { UpsertExperienceUseCase } from './use-cases/upsert-experience.use-case';
import { DeleteExperienceUseCase } from './use-cases/delete-experience.use-case';

@Injectable()
export class ExperienceService {
  constructor(
    private readonly upsertUc: UpsertExperienceUseCase,
    private readonly deleteUc: DeleteExperienceUseCase,
  ) {}

  createOrUpdate(resumeId: number, input: ExperienceDto, user: TokenDto) {
    return this.upsertUc.execute(resumeId, input, user);
  }

  delete(resumeId: number, experienceId: number, user: TokenDto) {
    return this.deleteUc.execute(resumeId, experienceId, user);
  }
}
