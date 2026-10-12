import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Applicant } from './entities/applicant.entity';
import { ApplicantController } from './applicant.controller';
import { ApplicantService } from './applicant.service';
import { APPLICANT_REPOSITORY } from './repositories/applicant.repository';
import { ApplicantTypeOrmRepository } from './repositories/applicant.typeorm.repository';
import { CreateApplicantUseCase } from './use-cases/create-applicant.use-case';
import { FindApplicantUseCase } from './use-cases/find-applicant.use-case';
import { UpdateApplicantUseCase } from './use-cases/update-applicant.use-case';
import { DeleteApplicantUseCase } from './use-cases/delete-applicant.use-case';
import { GeneratePasswordResetUseCase } from './use-cases/generate-password-reset.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import {
  HashNewPasswordHandler,
  ResetPasswordChainBuilder,
  ResolveApplicantByTokenHandler,
  ValidatePasswordStrengthHandler,
} from './chains/reset-password.chain';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Applicant]), MailModule],
  controllers: [ApplicantController],
  providers: [
    {
      provide: APPLICANT_REPOSITORY,
      useClass: ApplicantTypeOrmRepository,
    },
    // Use-cases
    CreateApplicantUseCase,
    FindApplicantUseCase,
    UpdateApplicantUseCase,
    DeleteApplicantUseCase,
    GeneratePasswordResetUseCase,
    ResetPasswordUseCase,
    // CoR handlers
    ValidatePasswordStrengthHandler,
    ResolveApplicantByTokenHandler,
    HashNewPasswordHandler,
    ResetPasswordChainBuilder,
    // Legacy facade
    ApplicantService,
  ],
  exports: [APPLICANT_REPOSITORY, ApplicantService],
})
export class ApplicantModule {}
