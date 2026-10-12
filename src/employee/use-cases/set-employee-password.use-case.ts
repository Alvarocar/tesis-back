import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ValidationError } from 'src/shared/errors/domain.error';
import type { SetPasswordDto } from '../dto/set-password.dto';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';
import {
  SetPasswordChainBuilder,
  type SetPasswordContext,
} from '../chains/set-employee-password.chain';

/**
 * Use-case: setear password a partir de un token de invitación.
 *
 * Flujo (CoR):
 * 1. ResolveToken: valida y resuelve `employeeId`.
 * 2. HashPassword: hook para reglas futuras.
 *
 * Persistencia: en una transacción (DB transactional por EntityManager),
 * - updatea `password` + `isActive = true`.
 * - limpia `invitationToken` + `invitationTokenExpires`.
 */
@Injectable()
export class SetEmployeePasswordUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    private readonly chainBuilder: SetPasswordChainBuilder,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(input: SetPasswordDto): Promise<void> {
    return this.logger.timed(
      'employee.setPassword',
      async () => {
        const ctx: SetPasswordContext = {
          token: input.token,
          newPassword: input.password,
        };
        await this.chainBuilder.build().handle(ctx);

        if (!ctx.employeeId) {
          throw new ValidationError(
            'No se pudo resolver el empleado por token',
          );
        }
        const hashed = await bcrypt.hash(input.password, 10);

        await this.employeeRepo.setPassword(ctx.employeeId, hashed);
        await this.employeeRepo.clearInvitationToken(ctx.employeeId);

        this.logger.info('employee.setPassword.completed', {
          employeeId: ctx.employeeId,
        });
      },
      { token: 'redacted' },
    );
  }
}
