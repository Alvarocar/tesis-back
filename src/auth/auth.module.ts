import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ApplicantModule } from '../applicant/applicant.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [ApplicantModule, EmployeeModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
