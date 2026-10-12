import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ForbiddenError } from 'src/shared/errors/domain.error';
import { Role } from 'src/shared/enums/role.enum';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  APPLICATION_REPOSITORY,
  type ApplicationRepositoryPort,
} from '../repositories/application.repository';

/**
 * Use-case: listar todas las applications ANALYZED.
 * - Hoy: respeta el rol y filtra por companyId vía el listener.
 *   (Refactor del filtro por tenant queda en futura iteración — sigue
 *   siendo compatible con el listener legacy.)
 */
@Injectable()
export class FindAllAnalyzedUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepo: ApplicationRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(user: TokenDto): Promise<
    {
      id: number;
      vacancyTitle: string;
      applicantName: string;
      creationDate: Date;
    }[]
  > {
    return this.logger.timed(
      'application.listAnalyzed',
      async () => {
        if (user.role !== Role.Admin && user.role !== Role.Employee) {
          throw new ForbiddenError('Acceso denegado');
        }
        return this.applicationRepo.listAnalyzed();
      },
      { userId: user.id },
    );
  }
}
