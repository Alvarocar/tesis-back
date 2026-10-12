import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import type { EmployeeFilterDto } from '../dto/employee-filter.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import type { EmployeeOverviewDto } from '../dto/employee-overview.dto';
import { ParsingUtil } from 'src/shared/utils/parsing.util';
import { normalizePagination } from 'src/shared/utils/typeorm-pagination.util';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';

/**
 * Use-case: buscar empleados de la empresa del usuario autenticado
 * con paginación. Saca `password` del select (no hay `password` en
 * el DTO de salida, pero evitar cargarlo reduce leak + bandwidth).
 */
@Injectable()
export class FindEmployeesUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(filter: EmployeeFilterDto, user: TokenDto) {
    return this.logger.timed(
      'employee.list',
      async () => {
        const { page, pageSize } = normalizePagination(filter);
        const { data, total } = await this.employeeRepo.searchByCompany(
          user.companyId ?? -1,
          { page, pageSize },
        );
        const mapped: EmployeeOverviewDto[] = data.map((e) => ({
          id: e.id,
          firstName: e.firstName,
          lastName: e.lastName ?? '',
          email: e.email,
          role: String(e.role),
          hasAccount: e.hasAccount,
        }));
        if (user.companyId === undefined) throw new NotFoundError('Company');
        return ParsingUtil.paginate(mapped, total, page, pageSize);
      },
      { companyId: user.companyId },
    );
  }
}
