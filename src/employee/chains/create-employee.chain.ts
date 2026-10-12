import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ConflictError, ValidationError } from 'src/shared/errors/domain.error';
import { BaseChainHandler } from 'src/shared/chains/base-chain.handler';
import { randomBytes } from 'crypto';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';
import {
  COMPANY_REPOSITORY,
  type CompanyRepositoryPort,
} from 'src/company/repositories/company.repository';

export interface CreateEmployeeContext {
  readonly email: string;
  readonly companyId: number;
  invitationToken?: string;
  invitationTokenExpires?: Date;
}

@Injectable()
export class EnsureUniqueEmailHandler extends BaseChainHandler<CreateEmployeeContext> {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {
    super();
  }

  protected async process(ctx: CreateEmployeeContext): Promise<void> {
    const existing = await this.employeeRepo.findByEmail(ctx.email);
    if (existing) {
      throw new ConflictError('El correo ya está en uso', { email: ctx.email });
    }
    this.logger.debug('employee.create.emailUnique', { email: ctx.email });
  }
}

@Injectable()
export class EnsureCompanyExistsHandler extends BaseChainHandler<CreateEmployeeContext> {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: CompanyRepositoryPort,
  ) {
    super();
  }

  protected async process(ctx: CreateEmployeeContext): Promise<void> {
    const company = await this.companyRepo.findActiveById(ctx.companyId);
    if (!company) {
      throw new ValidationError('La compañía no existe o está inactiva', {
        companyId: ctx.companyId,
      });
    }
  }
}

@Injectable()
export class GenerateInvitationTokenHandler extends BaseChainHandler<CreateEmployeeContext> {
  protected process(ctx: CreateEmployeeContext): Promise<void> {
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    ctx.invitationToken = token;
    ctx.invitationTokenExpires = expires;
    return Promise.resolve();
  }
}

@Injectable()
export class CreateEmployeeChainBuilder {
  constructor(
    private readonly uniqueEmail: EnsureUniqueEmailHandler,
    private readonly companyExists: EnsureCompanyExistsHandler,
    private readonly generateToken: GenerateInvitationTokenHandler,
  ) {}

  build() {
    return this.uniqueEmail
      .setNext(this.companyExists)
      .setNext(this.generateToken);
  }
}
