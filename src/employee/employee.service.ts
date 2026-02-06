import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { MailService } from '../mail/mail.service';
import { SetPasswordDto } from './dto/set-password.dto';
import { CompanyService } from '../company/company.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { ParsingUtil } from 'src/shared/utils/parsing.util';
import { EmployeeFilterDto } from './dto/employee-filter.dto';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { EmployeeOverviewDto } from './dto/employee-overview.dto';
import { FRONTEND_URL } from 'src/shared/constants/env.constant';

@Injectable()
export class EmployeeService {
  private readonly FRONTEND_INVITATION = new URL(
    '/empleados/restablecer-contrasena',
    FRONTEND_URL || '',
  );

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly mailService: MailService,
    private readonly companyService: CompanyService,
  ) {}

  findByEmail(email: string) {
    return this.employeeRepository.findOne({ where: { email } });
  }

  /**
   * Genera un token de invitación seguro
   */
  private generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Calcula la fecha de expiración del token (24 horas)
   */
  private getTokenExpiration(): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    return expiration;
  }

  async createEmployee(
    createEmployeeDto: CreateEmployeeDto,
    companyId: number,
  ) {
    if (await this.findByEmail(createEmployeeDto.email)) {
      throw new ConflictException('El correo ya está en uso');
    }

    // Verificar que la compañía existe
    await this.companyService.findOne(companyId);

    const invitationToken = this.generateInvitationToken();
    const invitationTokenExpires = this.getTokenExpiration();

    const employee = this.employeeRepository.create({
      firstName: createEmployeeDto.firstName,
      lastName: createEmployeeDto.lastName,
      email: createEmployeeDto.email,
      companyId,
      invitationToken,
      invitationTokenExpires,
    });

    const savedEmployee = await this.employeeRepository.save(employee);

    const invitationUrl = `${this.FRONTEND_INVITATION.toString()}?token=${invitationToken}`;

    // Enviar correo de invitación
    await this.mailService.sendEmail({
      key: 'welcome.employee',
      to: savedEmployee.email,
      subject: '¡Bienvenido a NextStep! Configura tu cuenta',
      context: {
        name: savedEmployee.firstName + ' ' + savedEmployee.lastName,
        expirationHours: '24',
        invitationUrl: invitationUrl,
      },
    });
  }

  /**
   * Valida el token y establece la contraseña del empleado
   */
  async setPassword(setPasswordDto: SetPasswordDto) {
    const employee = await this.employeeRepository.findOne({
      where: { invitationToken: setPasswordDto.token },
    });

    if (!employee) {
      throw new NotFoundException('Token de invitación inválido');
    }

    // Verificar si el token ha expirado
    if (
      employee.invitationTokenExpires &&
      new Date() > employee.invitationTokenExpires
    ) {
      throw new BadRequestException('El token de invitación ha expirado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(setPasswordDto.password, 10);

    // Actualizar el empleado
    employee.password = hashedPassword;
    employee.invitationToken = null;
    employee.invitationTokenExpires = null;
    employee.isActive = true;

    await this.employeeRepository.save(employee);

    return { message: 'Contraseña establecida exitosamente' };
  }

  /**
   * Reenvía la invitación generando un nuevo token
   */
  async resendInvitation(email: string) {
    const employee = await this.findByEmail(email);

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // Generar nuevo token
    const invitationToken = this.generateInvitationToken();
    const invitationTokenExpires = this.getTokenExpiration();

    employee.invitationToken = invitationToken;
    employee.invitationTokenExpires = invitationTokenExpires;

    await this.employeeRepository.save(employee);

    // Reenviar correo de invitación

    await this.mailService.sendEmail({
      key: 'welcome.employee',
      to: employee.email,
      subject: 'Reenvío de invitación - Configura tu cuenta',
      context: {
        name: employee.firstName + ' ' + employee.lastName,
        expirationHours: '24',
        invitationUrl: `${this.FRONTEND_INVITATION.toString()}?token=${invitationToken}`,
      },
    });

    return { message: 'Invitación reenviada exitosamente' };
  }

  /**
   * Verifica si un token es válido
   */
  async validateToken(token: string) {
    const employee = await this.employeeRepository.findOne({
      where: { invitationToken: token },
    });

    if (!employee) {
      return { valid: false, message: 'Token inválido' };
    }

    if (
      employee.invitationTokenExpires &&
      new Date() > employee.invitationTokenExpires
    ) {
      return { valid: false, message: 'Token expirado' };
    }

    return {
      valid: true,
      email: employee.email,
      name: `${employee.firstName} ${employee.lastName}`,
    };
  }

  /**
   * Obtiene todos los empleados de una compañía
   */
  async findAll(filter: EmployeeFilterDto, user: TokenDto) {
    filter.page = filter.page || 1;
    filter.pageSize = filter.pageSize || 10;
    const query = this.employeeRepository.createQueryBuilder('employee');

    query
      .where('employee.companyId = :companyId', { companyId: user.companyId })
      .andWhere('employee.isActive = :isActive', { isActive: true });

    const [employees, count] = await query
      .select([
        'employee.id',
        'employee.firstName',
        'employee.lastName',
        'employee.email',
        'employee.role',
        'employee.password',
      ])
      .skip((filter.page - 1) * filter.pageSize)
      .take(filter.pageSize)
      .orderBy('employee.creationDate', 'DESC')
      .getManyAndCount();

    // Map the result to EmployeeOverviewDto
    const mappedEmployees: EmployeeOverviewDto[] = employees.map(
      (employee) => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        hasAccount: !!employee.password, // Compute hasAccount based on password
      }),
    );

    // Use ParsingUtil to format the response
    return ParsingUtil.paginate(
      mappedEmployees,
      count,
      filter.page,
      filter.pageSize,
    );
  }

  /**
   * Obtiene un empleado específico de una compañía
   */
  async findOneByCompany(employeeId: number, companyId: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, companyId, isActive: true },
      relations: ['company'],
    });

    if (!employee) {
      throw new NotFoundException(
        'Empleado no encontrado o no pertenece a esta compañía',
      );
    }

    return employee;
  }

  /**
   * Valida que un empleado pertenezca a una compañía específica
   */
  async validateEmployeeCompany(
    employeeId: number,
    companyId: number,
  ): Promise<boolean> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, companyId },
    });
    return !!employee;
  }
}
