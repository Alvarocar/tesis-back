import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ConflictError } from 'src/shared/errors/domain.error';
import type { CreateCompanyDto } from '../dto/create-company.dto';
import {
  COMPANY_REPOSITORY,
  type CompanyRepositoryPort,
} from '../repositories/company.repository';

/**
 * Use-case: crear una empresa.
 */
@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: CompanyRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(input: CreateCompanyDto) {
    return this.logger.timed(
      'company.create',
      async () => {
        const existing = await this.companyRepo.findByNit(input.nit);
        if (existing) {
          throw new ConflictError('El NIT ya está registrado', {
            nit: input.nit,
          });
        }
        return this.companyRepo.insert({
          name: input.name,
          nit: input.nit,
          address: input.address,
          phone: input.phone,
        });
      },
      { nit: input.nit },
    );
  }
}
