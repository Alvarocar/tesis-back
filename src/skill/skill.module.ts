import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from 'src/resume/entities/resume.entity';
import { Skill } from 'src/shared/db/entities/skill.entity';
import { SkillService } from './skill.service';
import { SkillTypeOrmRepository } from './repositories/skill.typeorm.repository';
import { SKILL_REPOSITORY } from 'src/resume/repositories/sub-resource.repositories';
import { ReplaceSkillsForApplicantUseCase } from './use-cases/replace-skills.use-case';
import { ResumeModule } from 'src/resume/resume.module';

@Module({
  imports: [TypeOrmModule.forFeature([Resume, Skill]), forwardRef(() => ResumeModule)],
  providers: [
    {
      provide: SKILL_REPOSITORY,
      useClass: SkillTypeOrmRepository,
    },
    ReplaceSkillsForApplicantUseCase,
    SkillService,
  ],
  exports: [SkillService, SKILL_REPOSITORY],
})
export class SkillModule {}
