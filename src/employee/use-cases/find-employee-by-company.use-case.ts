import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';

/**
 * Use-case: encontrar un empleado que pertenezca a una compañía.
 */
@Injectable()
export class FindEmployeeByCompanyUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(employeeId: number, companyId: number) {
    return this.logger.timed(
      'employee.findByCompany',
      async () => {
        const employee = await this.employeeRepo.findByCompanyAndId(
          employeeId,
          companyId,
        );
        if (!employee) {
          throw new NotFoundError(
            'Employee no encontrado en la compañía',
            employeeId,
          );
        }
        return employee;
      },
      { employeeId, companyId },
    );
  }
}
