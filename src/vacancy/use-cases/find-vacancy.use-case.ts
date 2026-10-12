import { Inject, Injectable } from '@nestjs/common';
import { DateUtil } from 'src/shared/utils/date.util';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError, ForbiddenError } from 'src/shared/errors/domain.error';
import { Role } from 'src/shared/enums/role.enum';
import { VacancyStatus } from '../enums/vacancy-status.enum';
import type { CreatedVacancyDto } from '../dto/created-vacancy.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  type VacancyRepositoryPort,
  VACANCY_REPOSITORY,
} from '../repositories/vacancy.repository';

/**
 * Use-case: obtener detalle de una vacante.
 * - Aislamiento de tenant: si no es Admin, debe pertenecer a su empresa.
 * - Solo se devuelven vacantes en `ENABLE` por defecto.
 */
@Injectable()
export class FindVacancyUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    id: number,
    user: TokenDto,
    status: VacancyStatus = VacancyStatus.ENABLE,
  ): Promise<CreatedVacancyDto> {
    return this.logger.timed(
      'vacancy.findOne',
      async () => {
        const vacancy =
          user.companyId !== undefined
            ? await this.vacancyRepo.findByIdAndCompany(
                id,
                user.companyId,
                status,
              )
            : user.role === Role.Admin
              ? await this.vacancyRepo.findByIdWithEmployee(id)
              : null;

        if (!vacancy) {
          throw new NotFoundError('Vacante', id);
        }

        const employeeId =
          typeof vacancy.employee === 'number'
            ? vacancy.employee
            : (vacancy.employee as { id: number }).id;

        return {
          id: vacancy.id,
          title: vacancy.title,
          jobType: vacancy.jobType,
          salary: vacancy.salaryOffer ?? 0,
          description: vacancy.description,
          experienceYears: vacancy.experienceYears ?? 0,
          creationDate: DateUtil.toString(vacancy.creationDate),
          modificationDate: DateUtil.toString(vacancy.modificationDate),
          editable: user.role === Role.Admin || employeeId === user.id,
        } satisfies CreatedVacancyDto;
      },
      { vacancyId: id, userId: user.id },
    );
  }

  /**
   * Variante para rutas autenticadas pero donde el chequeo de tenant
   * se hace explícitamente más adelante (ej. archive).
   */
  async findByIdWithOwnershipCheck(
    id: number,
    user: TokenDto,
  ): Promise<{
    vacancy: { id: number; employee: { id: number; companyId: number } };
  }> {
    return this.logger.timed(
      'vacancy.findById.ownership',
      async () => {
        const vacancy = await this.vacancyRepo.findByIdWithEmployee(id);
        if (!vacancy) {
          throw new NotFoundError('Vacante', id);
        }
        const employee = vacancy.employee as {
          id: number;
          companyId: number;
        };
        if (
          user.role !== Role.Admin &&
          (!employee || employee.id !== user.id)
        ) {
          throw new ForbiddenError('No tiene permisos sobre esta vacante', {
            userId: user.id,
            vacancyId: id,
          });
        }
        return { vacancy: { id: vacancy.id, employee } };
      },
      { vacancyId: id, userId: user.id },
    );
  }
}
