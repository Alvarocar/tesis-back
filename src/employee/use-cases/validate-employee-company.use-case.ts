import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';

/**
 * Use-case: validar ownership empleado↔company.
 */
@Injectable()
export class ValidateEmployeeCompanyUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(employeeId: number, companyId: number): Promise<boolean> {
    return this.logger.timed(
      'employee.validateOwnership',
      async () => {
        return this.employeeRepo.validateOwnership(employeeId, companyId);
      },
      { employeeId, companyId },
    );
  }
}
