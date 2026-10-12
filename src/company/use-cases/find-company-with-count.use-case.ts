import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  COMPANY_REPOSITORY,
  type CompanyRepositoryPort,
} from '../repositories/company.repository';

/**
 * Use-case: obtener el detalle de la empresa (incluyendo el conteo
 * de empleados). Evita el cartesiano N+1 que tenía el código original
 * al hacer `relations: ['employees']`.
 */
@Injectable()
export class FindCompanyWithCountUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: CompanyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(companyId: number) {
    return this.logger.timed(
      'company.findWithCount',
      async () => {
        const company = await this.companyRepo.findWithEmployeeCount(companyId);
        if (!company) throw new NotFoundError('Company', companyId);
        return company;
      },
      { companyId },
    );
  }
}
