import { Controller, Post, Body, UseGuards, Get, Query, Patch } from '@nestjs/common';
import { Roles } from 'src/shared/constants/metadata.constant';
import { TokenGuard } from 'src/shared/security/guards/token.guard';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Role } from 'src/shared/enums/role.enum';
import { SetPasswordDto } from './dto/set-password.dto';
import { ResendInvitationDto } from './dto/resend-invitation.dto';

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
  @UseGuards(TokenGuard)
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(createEmployeeDto);
  }

  /**
   * Endpoint público para establecer contraseña con token
   */
  @Post('set-password')
  setPassword(@Body() setPasswordDto: SetPasswordDto) {
    return this.employeeService.setPassword(setPasswordDto);
  }

  /**
   * Endpoint público para validar un token
   */
  @Get('validate-token')
  validateToken(@Query('token') token: string) {
    return this.employeeService.validateToken(token);
  }

  /**
   * Endpoint para reenviar invitación
   */
  @Patch('resend-invitation')
  @Roles(Role.Admin)
  @UseGuards(TokenGuard)
  resendInvitation(@Body() resendInvitationDto: ResendInvitationDto) {
    return this.employeeService.resendInvitation(resendInvitationDto.email);
  }

}
