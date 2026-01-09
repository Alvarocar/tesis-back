import {
  Controller,
  Post,
  Body,
  HttpCode,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { SecurityService } from 'src/shared/security/security.service';
import { CreatedApplicantDto } from './dto/created-applicant.dto';
import { Role } from 'src/shared/enums/role.enum';
import { SignInDto } from './dto/sign-in.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly securityService: SecurityService,
  ) {}

  @Post('/sign-up')
  @HttpCode(201)
  async createApplicant(
    @Body(new ValidationPipe({ transform: true }))
    createApplicantDto: CreateApplicantDto,
  ) {
    const applicant =
      await this.authService.createApplicant(createApplicantDto);
    const token = await this.securityService.generateToken({
      email: applicant.email,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      id: applicant.id,
      role: Role.Applicant,
    });
    return {
      data: new CreatedApplicantDto({
        email: applicant.email,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        id: applicant.id,
        token,
      }),
    };
  }

  @Put('/sign-in')
  @HttpCode(200)
  async signInApplicant(
    @Body(new ValidationPipe({ transform: true })) signInDto: SignInDto,
  ) {
    const applicant = await this.authService.signInApplicant(signInDto);
    const token = await this.securityService.generateToken({
      email: applicant.email,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      id: applicant.id,
      role: Role.Applicant,
    });
    return {
      data: new CreatedApplicantDto({
        email: applicant.email,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        id: applicant.id,
        token,
      }),
    };
  }

  /*  @Post('/sign-up/employee')
  @HttpCode(201)
  async createEmployee(@Body(new ValidationPipe({ transform: true })) createApplicantDto: CreateApplicantDto) {
    const applicant = await this.authService.createApplicant(createApplicantDto);
    return { data: applicant };
  } */

  @Put('/sign-in/employee')
  @HttpCode(200)
  async signInEmployee(
    @Body(new ValidationPipe({ transform: true })) signInDto: SignInDto,
  ) {
    const employee = await this.authService.signInEmployee(signInDto);
    const token = await this.securityService.generateToken({
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      id: employee.id,
      role: employee.role.toString() as Role,
      companyId: employee.companyId,
    });
    return {
      data: new CreatedApplicantDto({
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        id: employee.id,
        token,
      }),
    };
  }
}
