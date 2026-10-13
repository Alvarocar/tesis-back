import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError, ValidationError } from 'src/shared/errors/domain.error';
import { BaseChainHandler } from 'src/shared/chains/base-chain.handler';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';

export interface SetPasswordContext {
  readonly token: string;
  readonly newPassword: string;
  employeeId?: number;
  hashedPassword?: string;
}

@Injectable()
export class ResolveTokenHandler extends BaseChainHandler<SetPasswordContext> {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {
    super();
  }

  protected async process(ctx: SetPasswordContext): Promise<void> {
    const employee = await this.employeeRepo.findByInvitationToken(ctx.token);
    if (!employee) {
      throw new NotFoundError('Token de invitación inválido');
    }
    if (
      employee.invitationTokenExpires &&
      new Date() > employee.invitationTokenExpires
    ) {
      throw new ValidationError('El token de invitación ha expirado');
    }
    ctx.employeeId = employee.id;
    this.logger.debug('employee.setPassword.resolved', {
      employeeId: employee.id,
    });
  }
}

@Injectable()
export class HashPasswordHandler extends BaseChainHandler<SetPasswordContext> {
  // bcrypt se inyecta desde el use-case para mantener el handler sin deps.
  protected process(): Promise<void> {
    return Promise.resolve();
  }
}

@Injectable()
export class SetPasswordChainBuilder {
  constructor(
    private readonly resolveToken: ResolveTokenHandler,
    private readonly hashPassword: HashPasswordHandler,
  ) {}

  build() {
    return this.resolveToken.setNext(this.hashPassword);
  }
}
