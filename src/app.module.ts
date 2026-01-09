import { Module } from '@nestjs/common';
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
import { LanguageModule } from './language/language.module';
import { MailModule } from './mail/mail.module';
import { CompanyModule } from './company/company.module';
import { getTypeOrmModule } from './database.setup';
import { TokenGuard } from './shared/security/guards/token.guard';

@Module({
  imports: [
    getTypeOrmModule(),
    ResumeModule,
    SharedModule,
    VacancyModule,
    EvaluationModule,
    LlmClientModule,
    AuthModule,
    ApplicantModule,
    EmployeeModule,
    JobModule,
    ApplicationModule,
    LanguageModule,
    MailModule,
    CompanyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
