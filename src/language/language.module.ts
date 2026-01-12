import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageService } from './language.service';
import { LanguageController } from './language.controller';
import { Language } from './entities/language.entity';
import { Resume } from 'src/resume/entities/resume.entity';
import { ResumeLanguage } from 'src/resume/entities/resume-language.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Language, Resume, ResumeLanguage])],
  controllers: [LanguageController],
  providers: [LanguageService],
  exports: [LanguageService],
})
export class LanguageModule {}
