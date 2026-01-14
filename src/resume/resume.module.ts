import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageModule } from 'src/language/language.module';
import { EducationModule } from 'src/education/education.module';
import { ResumeController } from './resume.controller';
import { Resume } from './entities/resume.entity';
import { ResumeService } from './resume.service';
import { ExperienceModule } from 'src/experience/experience.module';
import { SkillModule } from 'src/skill/skill.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume]),
    LanguageModule,
    EducationModule,
    ExperienceModule,
    SkillModule,
  ],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}
