import { Injectable } from '@nestjs/common';
import type { EducationDto } from 'src/resume/dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import { UpsertEducationUseCase } from './use-cases/upsert-education.use-case';
import { DeleteEducationUseCase } from './use-cases/delete-education.use-case';

/**
 * Legacy facade: delega en use-cases. Conservado para el controller.
 */
@Injectable()
export class EducationService {
  constructor(
    private readonly upsertUc: UpsertEducationUseCase,
    private readonly deleteUc: DeleteEducationUseCase,
  ) {}

  createOrUpdate(
    resumeId: number,
    education: EducationDto,
    user: TokenDto,
  ) {
    return this.upsertUc.execute(resumeId, education, user);
  }

  delete(resumeId: number, educationId: number, user: TokenDto) {
    return this.deleteUc.execute(resumeId, educationId, user);
  }
}
