import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { withTransaction } from 'src/shared/utils/transaction.util';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';

/**
 * Use-case: eliminar un empleado y reasignar sus vacantes a un admin.
 * Flujo:
 * 1. Validar que el admin existe.
 * 2. Validar que el empleado a eliminar existe.
 * 3. tx: reasignar vacantes (UPDATE vacantes) + delete empleado.
 */
@Injectable()
export class DeleteEmployeeUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(employeeId: number, adminId: number): Promise<void> {
    return this.logger.timed(
      'employee.delete',
      async () => {
        const employee = await this.employeeRepo.findById(employeeId);
        if (!employee) throw new NotFoundError('Employee', employeeId);

        const admin = await this.employeeRepo.findById(adminId);
        if (!admin) throw new NotFoundError('Admin', adminId);

        await withTransaction(this.dataSource, async (manager) => {
          await manager
            .createQueryBuilder()
            .update('vacancy')
            .set({ employee_id: adminId })
            .where('employee_id = :employeeId', { employeeId })
            .execute();
          await manager.delete('employee', { id: employeeId });
        });

        this.logger.info('employee.delete.completed', {
          employeeId,
          adminId,
        });
      },
      { employeeId, adminId },
    );
  }
}
