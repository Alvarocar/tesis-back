import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ConflictError, NotFoundError } from 'src/shared/errors/domain.error';
import type { UpdateCompanyDto } from '../dto/update-company.dto';
import {
  COMPANY_REPOSITORY,
  type CompanyRepositoryPort,
} from '../repositories/company.repository';

/**
 * Use-case: actualizar la empresa del usuario autenticado.
 *
 * Reglas:
 * - Si cambia el NIT, debe ser único.
 */
@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: CompanyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(companyId: number, input: UpdateCompanyDto): Promise<void> {
    return this.logger.timed(
      'company.update',
      async () => {
        const existing = await this.companyRepo.findActiveById(companyId);
        if (!existing) throw new NotFoundError('Company', companyId);

        if (input.nit && input.nit !== existing.nit) {
          const byNit = await this.companyRepo.findByNit(input.nit);
          if (byNit) {
            throw new ConflictError('El NIT ya está registrado', {
              nit: input.nit,
            });
          }
        }

        await this.companyRepo.update(companyId, {
          name: input.name,
          address: input.address,
          phone: input.phone,
          nit: input.nit,
        });
      },
      { companyId, updatedFields: Object.keys(input) },
    );
  }
}
