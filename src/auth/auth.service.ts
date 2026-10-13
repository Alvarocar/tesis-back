import { Injectable } from '@nestjs/common';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { ApplicantService } from '../applicant/applicant.service';
import { EmployeeService } from '../employee/employee.service';
import { SignInDto } from './dto/sign-in.dto';
import { SecurityService } from 'src/shared/security/security.service';
import { UnauthorizedError } from 'src/shared/errors/domain.error';

@Injectable()
export class AuthService {
  constructor(
    private readonly applicantService: ApplicantService,
    private readonly employeeService: EmployeeService,
    private readonly securityService: SecurityService,
  ) {}

  createApplicant(createApplicantDto: CreateApplicantDto) {
    return this.applicantService.create(createApplicantDto);
  }

  async signInApplicant(dto: SignInDto) {
    const applicant = await this.applicantService.findByEmail(dto.email);

    if (!applicant) {
      throw new UnauthorizedError('Credenciales inválidas', {
        email: dto.email,
      });
    }
    const isPasswordValid = await this.securityService.compareHash(
      dto.password,
      applicant.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas', {
        email: dto.email,
      });
    }

    return applicant;
  }

  async signInEmployee(dto: SignInDto) {
    const employee = await this.employeeService.findByEmail(dto.email);

    if (!employee) {
      throw new UnauthorizedError('Credenciales inválidas', {
        email: dto.email,
      });
    }
    if (!employee.password) {
      throw new UnauthorizedError(
        'La cuenta aún no tiene contraseña configurada',
        {
          email: dto.email,
        },
      );
    }
    const isPasswordValid = await this.securityService.compareHash(
      dto.password,
      employee.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas', {
        email: dto.email,
      });
    }

    return employee;
  }
}
