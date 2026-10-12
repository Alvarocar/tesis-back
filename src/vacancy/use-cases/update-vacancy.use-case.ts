import { Inject, Injectable } from '@nestjs/common';
import { DateUtil } from 'src/shared/utils/date.util';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { Role } from 'src/shared/enums/role.enum';
import type { CreatedVacancyDto } from '../dto/created-vacancy.dto';
import type { UpdateVacancyDto } from '../dto/update-vacancy.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  type VacancyRepositoryPort,
  VACANCY_REPOSITORY,
} from '../repositories/vacancy.repository';
import {
  UpdateVacancyChainBuilder,
  type UpdateVacancyContext,
} from '../chains/update-vacancy.chain';

/**
 * Use-case: actualizar una vacante.
 *
 * Flujo:
 * 1. Construir contexto (`dto`, `user`, `id`).
 * 2. Ejecutar `UpdateVacancyChain` (load + ownership + status transition).
 * 3. Persistir via port.
 * 4. Devolver `CreatedVacancyDto`.
 */
@Injectable()
export class UpdateVacancyUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly chainBuilder: UpdateVacancyChainBuilder,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(
    id: number,
    input: UpdateVacancyDto,
    user: TokenDto,
  ): Promise<CreatedVacancyDto> {
    return this.logger.timed(
      'vacancy.update',
      async () => {
        const ctx: UpdateVacancyContext = { id, dto: input, user };
        await this.chainBuilder.build().handle(ctx);

        // Persistir cambios.
        await this.vacancyRepo.update(id, {
          title: input.title,
          description: input.description,
          experienceYears: input.experienceYears,
          salaryOffer: input.salary,
          jobType: input.jobType,
        });

        // Re-leemos solo lo necesario para la respuesta.
        const updated = await this.vacancyRepo.findByIdWithEmployee(id);
        if (!updated) {
          // No debería pasar: la cadena garantiza que existe.
          throw new Error('Vacancy disappeared after update');
        }

        const employeeId =
          typeof updated.employee === 'number'
            ? updated.employee
            : (updated.employee as { id: number }).id;

        return {
          id: updated.id,
          title: updated.title,
          jobType: updated.jobType,
          salary: updated.salaryOffer ?? 0,
          description: updated.description,
          experienceYears: updated.experienceYears ?? 0,
          creationDate: DateUtil.toString(updated.creationDate),
          modificationDate: DateUtil.toString(updated.modificationDate),
          editable: user.role === Role.Admin || employeeId === user.id,
        } satisfies CreatedVacancyDto;
      },
      { vacancyId: id, userId: user.id },
    );
  }
}
