import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { DateUtil } from 'src/shared/utils/date.util';
import type { DetailApplicantDto } from 'src/auth/dto/detail-applicant.dto';
import {
  APPLICANT_REPOSITORY,
  type ApplicantRepositoryPort,
} from '../repositories/applicant.repository';

/**
 * Use-case: obtener un applicant por id.
 */
@Injectable()
export class FindApplicantUseCase {
  constructor(
    @Inject(APPLICANT_REPOSITORY)
    private readonly applicantRepo: ApplicantRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(id: number): Promise<DetailApplicantDto> {
    return this.logger.timed(
      'applicant.findOne',
      async () => {
        const applicant = await this.applicantRepo.findByIdOverview(id);
        if (!applicant) throw new NotFoundError('Applicant', id);

        return {
          firstName: applicant.firstName,
          lastName: applicant.lastName ?? '',
          email: applicant.email,
          id: applicant.id,
          creationDate: '',
          modificationDate: '',
          phoneNumber: applicant.phoneNumber ?? '',
          birthDate: applicant.birthDate
            ? DateUtil.toString(applicant.birthDate)
            : '',
          direction: applicant.direction ?? '',
          identification: applicant.identification ?? '',
          countryOfBirthId: applicant.countryOfBirthId ?? null,
          departmentOfBirthId: applicant.departmentOfBirthId ?? null,
          cityOfBirthId: applicant.cityOfBirthId ?? null,
          countryOfResidenceId: applicant.countryOfResidenceId ?? null,
          departmentOfResidenceId: applicant.departmentOfResidenceId ?? null,
          cityOfResidenceId: applicant.cityOfResidenceId ?? null,
          sex: applicant.sex ?? null,
          genre: applicant.genre ?? null,
          sexualOrientation: applicant.sexualOrientation ?? null,
          ethnicGroup: applicant.ethnicGroup ?? null,
          salaryAspiration: applicant.salaryAspiration ?? null,
        } satisfies DetailApplicantDto;
      },
      { applicantId: id },
    );
  }
}
