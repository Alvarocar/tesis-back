import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { Resume } from 'src/resume/entities/resume.entity';
import { ResumeLanguage } from 'src/resume/entities/resume-language.entity';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { LanguageTypeOrmRepository } from './repositories/language.typeorm.repository';
import { LANGUAGE_REPOSITORY } from 'src/resume/repositories/sub-resource.repositories';
import {
  ListAllLanguagesUseCase,
  ListLanguagesByResumeUseCase,
  SearchLanguagesUseCase,
} from './use-cases/find-languages.use-case';
import { ReplaceLanguagesForApplicantUseCase } from './use-cases/replace-languages.use-case';
import { ResumeModule } from 'src/resume/resume.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Language, Resume, ResumeLanguage]),
    forwardRef(() => ResumeModule),
  ],
  controllers: [LanguageController],
  providers: [
    {
      provide: LANGUAGE_REPOSITORY,
      useClass: LanguageTypeOrmRepository,
    },
    SearchLanguagesUseCase,
    ListAllLanguagesUseCase,
    ListLanguagesByResumeUseCase,
    ReplaceLanguagesForApplicantUseCase,
    LanguageService,
  ],
  exports: [LanguageService, LANGUAGE_REPOSITORY],
})
export class LanguageModule {}
