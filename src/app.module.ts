import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResumeModule } from './resume/resume.module';
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
import { VacancyModule } from './vacancy/vacancy.module';

@Module({
  imports: [ResumeModule, SharedModule, VacancyModule, EvaluationModule, LlmClientModule, AuthModule, ApplicantModule, EmployeeModule, JobModule, ApplicationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
