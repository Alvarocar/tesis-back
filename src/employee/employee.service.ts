import { Inject, Injectable } from '@nestjs/common';
import type { CreateEmployeeDto } from './dto/create-employee.dto';
import type { SetPasswordDto } from './dto/set-password.dto';
import type { EmployeeFilterDto } from './dto/employee-filter.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import { CreateEmployeeUseCase } from './use-cases/create-employee.use-case';
import { SetEmployeePasswordUseCase } from './use-cases/set-employee-password.use-case';
import { DeleteEmployeeUseCase } from './use-cases/delete-employee.use-case';
import { FindEmployeesUseCase } from './use-cases/find-employees.use-case';
import { FindEmployeeByCompanyUseCase } from './use-cases/find-employee-by-company.use-case';
import { ValidateEmployeeCompanyUseCase } from './use-cases/validate-employee-company.use-case';
import { ValidateTokenUseCase } from './use-cases/validate-token.use-case';
import { ResendInvitationUseCase } from './use-cases/resend-invitation.use-case';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from './repositories/employee.repository';

/**
 * Legacy facade: expone los métodos legacy que consume el controller,
 * delegando en use-cases + port.
 */
@Injectable()
export class EmployeeService {
  constructor(
    private readonly createUc: CreateEmployeeUseCase,
    private readonly setPasswordUc: SetEmployeePasswordUseCase,
    private readonly deleteUc: DeleteEmployeeUseCase,
    private readonly listUc: FindEmployeesUseCase,
    private readonly findByCompanyUc: FindEmployeeByCompanyUseCase,
    private readonly validateCompanyUc: ValidateEmployeeCompanyUseCase,
    private readonly validateTokenUc: ValidateTokenUseCase,
    private readonly resendUc: ResendInvitationUseCase,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
  ) {}

  createEmployee(input: CreateEmployeeDto, companyId: number) {
    return this.createUc.execute(input, companyId);
  }

  setPassword(input: SetPasswordDto) {
    return this.setPasswordUc.execute(input);
  }

  deleteEmployee(employeeId: number, adminId: number) {
    return this.deleteUc.execute(employeeId, adminId);
  }

  findAll(filter: EmployeeFilterDto, user: TokenDto) {
    return this.listUc.execute(filter, user);
  }

  findOneByCompany(employeeId: number, companyId: number) {
    return this.findByCompanyUc.execute(employeeId, companyId);
  }

  validateEmployeeCompany(employeeId: number, companyId: number) {
    return this.validateCompanyUc.execute(employeeId, companyId);
  }

  validateToken(token: string) {
    return this.validateTokenUc.execute(token);
  }

  resendInvitation(email: string) {
    return this.resendUc.execute(email);
  }

  /** Compat lookup usado por AuthService.signInEmployee. */
  findByEmail(email: string) {
    return this.employeeRepo.findByEmail(email);
  }
}
