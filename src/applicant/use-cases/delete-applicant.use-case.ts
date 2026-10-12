import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  APPLICANT_REPOSITORY,
  type ApplicantRepositoryPort,
} from '../repositories/applicant.repository';

/**
 * Use-case: desactivar la cuenta de un applicant.
 * Soft-delete vía `isActive = false`.
 */
@Injectable()
export class DeleteApplicantUseCase {
  constructor(
    @Inject(APPLICANT_REPOSITORY)
    private readonly applicantRepo: ApplicantRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(user: TokenDto): Promise<void> {
    return this.logger.timed(
      'applicant.softDelete',
      async () => {
        const existing = await this.applicantRepo.findById(user.id);
        if (!existing) throw new NotFoundError('Applicant', user.id);
        await this.applicantRepo.softDelete(user.id);
      },
      { applicantId: user.id },
    );
  }
}
