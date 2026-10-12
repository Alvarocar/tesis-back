import { Inject, Injectable } from '@nestjs/common';
import type { UpdateCompanyDto } from './dto/update-company.dto';
import { FindCompanyWithCountUseCase } from './use-cases/find-company-with-count.use-case';
import { UpdateCompanyUseCase } from './use-cases/update-company.use-case';
import { CreateCompanyUseCase } from './use-cases/create-company.use-case';
import {
  COMPANY_REPOSITORY,
  type CompanyRepositoryPort,
} from './repositories/company.repository';

/**
 * Legacy facade: delega en use-cases. Expone también `findByNit` para
 * compatibilidad con consumers existentes.
 */
@Injectable()
export class CompanyService {
  constructor(
    private readonly findUc: FindCompanyWithCountUseCase,
    private readonly updateUc: UpdateCompanyUseCase,
    private readonly createUc: CreateCompanyUseCase,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: CompanyRepositoryPort,
  ) {}

  findOne(id: number) {
    return this.findUc.execute(id);
  }

  update(id: number, dto: UpdateCompanyDto) {
    return this.updateUc.execute(id, dto);
  }

  create(dto: Parameters<CreateCompanyUseCase['execute']>[0]) {
    return this.createUc.execute(dto);
  }

  findByNit(nit: string) {
    return this.companyRepo.findByNit(nit);
  }
}
