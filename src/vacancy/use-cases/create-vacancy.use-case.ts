import { Inject, Injectable } from '@nestjs/common';
import { DateUtil } from 'src/shared/utils/date.util';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ForbiddenError } from 'src/shared/errors/domain.error';
import { Role } from 'src/shared/enums/role.enum';
import type { CreateVacancyDto } from '../dto/create-vacancy.dto';
import type { CreatedVacancyDto } from '../dto/created-vacancy.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  type VacancyRepositoryPort,
  VACANCY_REPOSITORY,
} from '../repositories/vacancy.repository';

/**
 * Use-case único: crear una vacante.
 * - Verifica que el usuario pueda crear vacantes (no Applicant).
 * - Persiste a través del port.
 * - Mapea entidad → DTO de salida.
 */
@Injectable()
export class CreateVacancyUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    input: CreateVacancyDto,
    user: TokenDto,
  ): Promise<CreatedVacancyDto> {
    if (user.role === Role.Applicant) {
      throw new ForbiddenError('Los applicants no pueden crear vacantes', {
        userId: user.id,
      });
    }

    return this.logger.timed(
      'vacancy.create',
      async () => {
        const vacancy = await this.vacancyRepo.insert({
          title: input.title,
          description: input.description,
          experienceYears: input.experienceYears,
          salaryOffer: input.salary,
          jobType: input.jobType,
          employeeId: user.id,
        });

        return {
          id: vacancy.id,
          title: vacancy.title,
          jobType: vacancy.jobType,
          salary: vacancy.salaryOffer ?? 0,
          description: vacancy.description,
          experienceYears: vacancy.experienceYears ?? 0,
          creationDate: DateUtil.toString(vacancy.creationDate),
          modificationDate: DateUtil.toString(vacancy.modificationDate),
          editable: true,
        } satisfies CreatedVacancyDto;
      },
      { userId: user.id, title: input.title },
    );
  }
}
