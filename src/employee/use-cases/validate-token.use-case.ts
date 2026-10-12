import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';

/**
 * Use-case: validar un token de invitación (sin escribir nada).
 */
@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(token: string): Promise<{
    valid: boolean;
    email?: string;
    name?: string;
    message?: string;
  }> {
    return this.logger.timed('employee.validateToken', async () => {
      const employee = await this.employeeRepo.findByInvitationToken(token);
      if (!employee) return { valid: false, message: 'Token inválido' };
      if (
        employee.invitationTokenExpires &&
        new Date() > employee.invitationTokenExpires
      ) {
        return { valid: false, message: 'Token expirado' };
      }
      return {
        valid: true,
        email: employee.email,
        name: `${employee.firstName} ${employee.lastName ?? ''}`.trim(),
      };
    });
  }
}
