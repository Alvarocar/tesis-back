import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { ApplicantService } from '../applicant/applicant.service';
import { EmployeeService } from '../employee/employee.service';
import { SignInDto } from './dto/sign-in.dto';
import { SecurityService } from 'src/shared/security/security.service';

@Injectable()
export class AuthService {  
  constructor(
    private readonly applicantService: ApplicantService,
    private readonly employeeService: EmployeeService,
    private readonly securityService: SecurityService
  ) {}

  createApplicant(createApplicantDto: CreateApplicantDto) { 
    return this.applicantService.create(createApplicantDto);
  }

  async signInApplicant(dto: SignInDto) {
    const applicant = await this.applicantService.findByEmail(dto.email);
    
    if (!applicant) throw new UnauthorizedException('Credenciales inválidas.');  
    const isPasswordValid = await this.securityService.compareHash(dto.password, applicant.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas.');
    
    return applicant;
  }

  async signInEmployee(dto: SignInDto) {
    // Implementation for employee sign-in
    const employee = await this.employeeService.findByEmail(dto.email);
    
    if (!employee) throw new UnauthorizedException('Credenciales inválidas.');  
    const isPasswordValid = await this.securityService.compareHash(dto.password, employee.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas.');
    
    return employee;
  }
}
