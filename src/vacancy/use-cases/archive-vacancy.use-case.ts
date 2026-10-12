import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ForbiddenError, NotFoundError } from 'src/shared/errors/domain.error';
import { Role } from 'src/shared/enums/role.enum';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  type VacancyRepositoryPort,
  VACANCY_REPOSITORY,
} from '../repositories/vacancy.repository';

/**
 * Use-case: archivar una vacante.
 */
@Injectable()
export class ArchiveVacancyUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(id: number, user: TokenDto): Promise<void> {
    return this.logger.timed(
      'vacancy.archive',
      async () => {
        const vacancy = await this.vacancyRepo.findByIdWithEmployee(id);
        if (!vacancy) throw new NotFoundError('Vacante', id);

        const employee = vacancy.employee as { id: number };
        if (user.role !== Role.Admin && employee.id !== user.id) {
          throw new ForbiddenError('No tiene permisos sobre esta vacante', {
            userId: user.id,
            vacancyId: id,
          });
        }

        await this.vacancyRepo.archive(id);
      },
      { vacancyId: id, userId: user.id },
    );
  }
}
