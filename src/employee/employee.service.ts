import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { MailService } from '../mail/mail.service';
import { SetPasswordDto } from './dto/set-password.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly mailService: MailService,
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

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {

    if (await this.findByEmail(createEmployeeDto.email)) {
      throw new ConflictException('El correo ya está en uso');
    }

    const invitationToken = this.generateInvitationToken();
    const invitationTokenExpires = this.getTokenExpiration();

    const employee = this.employeeRepository.create({
      firstName: createEmployeeDto.firstName,
      lastName: createEmployeeDto.lastName,
      email: createEmployeeDto.email,
      invitationToken,
      invitationTokenExpires,
    });
    
    const savedEmployee = await this.employeeRepository.save(employee);
    
    // Enviar correo de invitación
    await this.mailService.sendInvitationEmail(
      savedEmployee.email,
      savedEmployee.firstName,
      invitationToken,
    );
    
    return savedEmployee;
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
    if (new Date() > employee.invitationTokenExpires) {
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

    if (employee.password) {
      throw new BadRequestException('El empleado ya ha activado su cuenta');
    }

    // Generar nuevo token
    const invitationToken = this.generateInvitationToken();
    const invitationTokenExpires = this.getTokenExpiration();

    employee.invitationToken = invitationToken;
    employee.invitationTokenExpires = invitationTokenExpires;

    await this.employeeRepository.save(employee);

    // Reenviar correo de invitación
    await this.mailService.sendInvitationEmail(
      employee.email,
      employee.firstName,
      invitationToken,
    );

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

    if (new Date() > employee.invitationTokenExpires) {
      return { valid: false, message: 'Token expirado' };
    }

    return {
      valid: true,
      email: employee.email,
      name: `${employee.firstName} ${employee.lastName}`,
    };
  }
}
