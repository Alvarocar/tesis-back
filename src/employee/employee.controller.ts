import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { Roles } from 'src/shared/constants/metadata.constant';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Role } from 'src/shared/enums/role.enum';
import { SetPasswordDto } from './dto/set-password.dto';
import { ResendInvitationDto } from './dto/resend-invitation.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { Query } from '@nestjs/common';
import { EmployeeFilterDto } from './dto/employee-filter.dto';

@Controller('v1/recruiter')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  /*   @Post('/sign-up')
  @UseBefore(validationMiddleware(RecruiterDtoSignUp, 'body'))
  @UseBefore(authPasswordMiddleware)
  @HttpCode(201)
  async signUp(@Body() recruiter: RecruiterDtoSignUp) {
    const resp = await this.recruiterService.signUp(recruiter);
    return { message: `Reclutador: ${resp.email} creado!` };
  } */

  @Post()
  @Roles(Role.Admin)
  @HttpCode(204)
  createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentUser() user: Required<TokenDto>,
  ) {
    // Si el usuario tiene companyId, usarlo; sino usar el del DTO
    const employeeDto = {
      ...createEmployeeDto,
      companyId: user.companyId,
    };
    return this.employeeService.createEmployee(employeeDto, user.companyId);
  }

  /**
   * Obtener todos los empleados de la compañía del usuario
   */
  @Get()
  @Roles(Role.Admin)
  async findByCompany(
    @Query() filter: EmployeeFilterDto,
    @CurrentUser() user: Required<TokenDto>,
  ) {
    return await this.employeeService.findAll(filter, user);
  }

  /**
   * Obtener el empleado actual
   */
  @Get('me')
  @Roles(Role.Employee, Role.Admin)
  async getCurrentEmployee(@CurrentUser() user: Required<TokenDto>) {
    return this.employeeService.findOneByCompany(user.id, user.companyId);
  }

  /**
   * Obtener un empleado específico de la compañía del usuario
   */
  @Get(':id')
  @Roles(Role.Admin)
  findOneEmployee(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Required<TokenDto>,
  ) {
    return this.employeeService.findOneByCompany(id, user.companyId);
  }

  /**
   * Endpoint público para establecer contraseña con token
   */
  @Post('set-password')
  setPassword(@Body() setPasswordDto: SetPasswordDto) {
    return this.employeeService.setPassword(setPasswordDto);
  }

  /**
   * Endpoint para reenviar invitación
   */
  @Patch('resend-invitation')
  @Roles(Role.Admin)
  @HttpCode(204)
  resendInvitation(@Body() resendInvitationDto: ResendInvitationDto) {
    return this.employeeService.resendInvitation(resendInvitationDto.email);
  }

  /**
   * Delete an employee, reassigning their vacancies to the admin
   */
  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(204)
  async deleteEmployee(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Required<TokenDto>,
  ) {
    return this.employeeService.deleteEmployee(id, user.id);
  }
}
