import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ForbiddenError, NotFoundError } from 'src/shared/errors/domain.error';
import { Role } from 'src/shared/enums/role.enum';
import { BaseChainHandler } from 'src/shared/chains/base-chain.handler';
import type { UpdateVacancyDto } from '../dto/update-vacancy.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import type { Vacancy } from '../entities/vacancy.entity';
import {
  type VacancyRepositoryPort,
  VACANCY_REPOSITORY,
} from '../repositories/vacancy.repository';

/**
 * Contexto compartido por todos los handlers de la cadena.
 * Cada handler puede mutar `vacancyLoaded` para evitar recargas.
 */
export interface UpdateVacancyContext {
  readonly id: number;
  readonly dto: UpdateVacancyDto;
  readonly user: TokenDto;
  vacancyLoaded?: Vacancy;
}

/**
 * Handler: valida la existencia y carga la vacancy.
 * Si existe, la deja en `ctx.vacancyLoaded` para los siguientes handlers.
 */
@Injectable()
export class LoadAndValidateVacancyHandler extends BaseChainHandler<UpdateVacancyContext> {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {
    super();
  }

  protected async process(ctx: UpdateVacancyContext): Promise<void> {
    const vacancy = await this.vacancyRepo.findByIdWithEmployee(ctx.id);
    if (!vacancy) {
      throw new NotFoundError('Vacante', ctx.id);
    }
    ctx.vacancyLoaded = vacancy;
    this.logger.debug('vacancy.update.loaded', { vacancyId: ctx.id });
  }
}

/**
 * Handler: valida el ownership (Admin o empleado dueño).
 */
@Injectable()
export class ValidateOwnershipHandler extends BaseChainHandler<UpdateVacancyContext> {
  protected async process(ctx: UpdateVacancyContext): Promise<void> {
    if (!ctx.vacancyLoaded) {
      throw new NotFoundError('Vacante', ctx.id);
    }
    const employee = ctx.vacancyLoaded.employee as { id: number };
    if (ctx.user.role !== Role.Admin && employee.id !== ctx.user.id) {
      throw new ForbiddenError('No tiene permisos sobre esta vacante', {
        userId: ctx.user.id,
        vacancyId: ctx.id,
      });
    }
  }
}

/**
 * Handler: valida que el status actual permita la transición.
 * (Hook para futuras reglas; hoy es pass-through, pero está el esqueleto).
 */
@Injectable()
export class ValidateStatusTransitionHandler extends BaseChainHandler<UpdateVacancyContext> {
  protected async process(_ctx: UpdateVacancyContext): Promise<void> {
    // Aquí podrían agregarse reglas: ej. no se puede editar una vacante
    // ARCHIVED. Al presente es pasivo, pero la cadena sigue componiendo.
    return;
  }
}

/**
 * Builder de la cadena, listo para inyectar en el use-case.
 */
@Injectable()
export class UpdateVacancyChainBuilder {
  constructor(
    private readonly load: LoadAndValidateVacancyHandler,
    private readonly ownership: ValidateOwnershipHandler,
    private readonly statusTransition: ValidateStatusTransitionHandler,
  ) {}

  build() {
    return this.load.setNext(this.ownership).setNext(this.statusTransition);
  }
}
