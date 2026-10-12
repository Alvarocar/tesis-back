import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EMPLOYEE_REPOSITORY } from './repositories/employee.repository';
import { EmployeeTypeOrmRepository } from './repositories/employee.typeorm.repository';
import { CreateEmployeeUseCase } from './use-cases/create-employee.use-case';
import { SetEmployeePasswordUseCase } from './use-cases/set-employee-password.use-case';
import { DeleteEmployeeUseCase } from './use-cases/delete-employee.use-case';
import { FindEmployeesUseCase } from './use-cases/find-employees.use-case';
import { FindEmployeeByCompanyUseCase } from './use-cases/find-employee-by-company.use-case';
import { ValidateEmployeeCompanyUseCase } from './use-cases/validate-employee-company.use-case';
import { ValidateTokenUseCase } from './use-cases/validate-token.use-case';
import { ResendInvitationUseCase } from './use-cases/resend-invitation.use-case';
import {
  CreateEmployeeChainBuilder,
  EnsureCompanyExistsHandler,
  EnsureUniqueEmailHandler,
  GenerateInvitationTokenHandler,
} from './chains/create-employee.chain';
import {
  HashPasswordHandler,
  ResolveTokenHandler,
  SetPasswordChainBuilder,
} from './chains/set-employee-password.chain';
import { CompanyModule } from 'src/company/company.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), CompanyModule, MailModule],
  controllers: [EmployeeController],
  providers: [
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: EmployeeTypeOrmRepository,
    },
    // Use-cases
    CreateEmployeeUseCase,
    SetEmployeePasswordUseCase,
    DeleteEmployeeUseCase,
    FindEmployeesUseCase,
    FindEmployeeByCompanyUseCase,
    ValidateEmployeeCompanyUseCase,
    ValidateTokenUseCase,
    ResendInvitationUseCase,
    // CoR handlers (create)
    EnsureUniqueEmailHandler,
    EnsureCompanyExistsHandler,
    GenerateInvitationTokenHandler,
    CreateEmployeeChainBuilder,
    // CoR handlers (setPassword)
    ResolveTokenHandler,
    HashPasswordHandler,
    SetPasswordChainBuilder,
    // Facade
    EmployeeService,
  ],
  exports: [EmployeeService, EMPLOYEE_REPOSITORY],
})
export class EmployeeModule {}
