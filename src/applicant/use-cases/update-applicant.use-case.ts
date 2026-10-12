import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { DateUtil } from 'src/shared/utils/date.util';
import type { UpdateApplicantDto } from '../dto/update-applicant.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  APPLICANT_REPOSITORY,
  type ApplicantRepositoryPort,
} from '../repositories/applicant.repository';

/**
 * Use-case: actualizar datos personales de un applicant.
 */
@Injectable()
export class UpdateApplicantUseCase {
  constructor(
    @Inject(APPLICANT_REPOSITORY)
    private readonly applicantRepo: ApplicantRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    user: TokenDto,
    input: UpdateApplicantDto,
  ): Promise<UpdateApplicantDto> {
    return this.logger.timed(
      'applicant.update',
      async () => {
        await this.applicantRepo.update(user.id, {
          firstName: input.firstName,
          lastName: input.lastName,
          identification: input.identification,
          phoneNumber: input.phoneNumber,
          birthDate: input.birthDate
            ? DateUtil.toDate(input.birthDate)
            : undefined,
          direction: input.direction,
        });

        const updated = await this.applicantRepo.findByIdOverview(user.id);
        if (!updated) throw new NotFoundError('Applicant', user.id);

        return {
          firstName: updated.firstName,
          lastName: updated.lastName ?? '',
          identification: updated.identification ?? '',
          phoneNumber: updated.phoneNumber ?? '',
          direction: updated.direction ?? '',
          birthDate: updated.birthDate
            ? DateUtil.toString(updated.birthDate)
            : '',
        } satisfies UpdateApplicantDto;
      },
      { applicantId: user.id },
    );
  }
}
