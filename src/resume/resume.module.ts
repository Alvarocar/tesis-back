import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageService } from 'src/language/language.service';
import { EducationService } from 'src/education/education.service';
import { ResumeController } from './resume.controller';
import { Resume } from './entities/resume.entity';
import { ResumeService } from './resume.service';
import { ExperienceService } from 'src/experience/experience.service';
import { SkillService } from 'src/skill/skill.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume]),
    LanguageService,
    EducationService,
    ExperienceService,
    SkillService,
  ],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}
