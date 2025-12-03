import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { VacancyModule } from './vacancy/vacancy.module';
import { ResumeModule } from './resume/resume.module';
import { ApplicationModule } from './application/application.module';
import { JobModule } from './job/job.module';
import { EmployeeModule } from './employee/employee.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { LlmClientModule } from './llm-client/llm-client.module';
import { AuthModule } from './auth/auth.module';
import { ApplicantModule } from './applicant/applicant.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './shared/security/guards/roles.guard';

@Module({
  imports: [ResumeModule, SharedModule, VacancyModule, EvaluationModule, LlmClientModule, AuthModule, ApplicantModule, EmployeeModule, JobModule, ApplicationModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule {}
