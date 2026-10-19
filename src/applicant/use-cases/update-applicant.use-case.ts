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
          countryOfBirthId: input.countryOfBirthId ?? undefined,
          departmentOfBirthId: input.departmentOfBirthId ?? undefined,
          cityOfBirthId: input.cityOfBirthId ?? undefined,
          countryOfResidenceId: input.countryOfResidenceId ?? undefined,
          departmentOfResidenceId: input.departmentOfResidenceId ?? undefined,
          cityOfResidenceId: input.cityOfResidenceId ?? undefined,
          sex: input.sex ?? undefined,
          genre: input.genre ?? undefined,
          sexualOrientation: input.sexualOrientation ?? undefined,
          ethnicGroup: input.ethnicGroup ?? undefined,
          salaryAspiration: input.salaryAspiration ?? undefined,
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
          countryOfBirthId: updated.countryOfBirthId ?? null,
          departmentOfBirthId: updated.departmentOfBirthId ?? null,
          cityOfBirthId: updated.cityOfBirthId ?? null,
          countryOfResidenceId: updated.countryOfResidenceId ?? null,
          departmentOfResidenceId: updated.departmentOfResidenceId ?? null,
          cityOfResidenceId: updated.cityOfResidenceId ?? null,
          sex: updated.sex ?? null,
          genre: updated.genre ?? null,
          sexualOrientation: updated.sexualOrientation ?? null,
          ethnicGroup: updated.ethnicGroup ?? null,
          salaryAspiration: updated.salaryAspiration ?? null,
        } satisfies UpdateApplicantDto;
      },
      { applicantId: user.id },
    );
  }
}
