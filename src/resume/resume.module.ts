import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from './entities/resume.entity';
import { Country } from 'src/geo/entities/country.entity';
import { Department } from 'src/geo/entities/department.entity';
import { City } from 'src/geo/entities/city.entity';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { RESUME_REPOSITORY } from './repositories/resume.repository';
import { ResumeTypeOrmRepository } from './repositories/resume.typeorm.repository';
import { CreateResumeUseCase } from './use-cases/create-resume.use-case';
import { FindResumeUseCase } from './use-cases/find-resume.use-case';
import { UpdateResumeTitleUseCase } from './use-cases/update-resume-title.use-case';
import { UpdateResumeAboutMeUseCase } from './use-cases/update-about-me.use-case';
import { ListResumesUseCase } from './use-cases/list-resumes.use-case';
import { DeleteResumeUseCase } from './use-cases/delete-resume.use-case';
import {
  DeleteResumeChainBuilder,
  PerformSoftDeleteHandler,
  ValidateOwnershipHandler,
} from './chains/delete-resume.chain';
import { EducationModule } from 'src/education/education.module';
import { ExperienceModule } from 'src/experience/experience.module';
import { LanguageModule } from 'src/language/language.module';
import { SkillModule } from 'src/skill/skill.module';
import { KnowledgeModule } from 'src/shared/db/knowledge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, Country, Department, City]),
    EducationModule,
    ExperienceModule,
    LanguageModule,
    SkillModule,
    KnowledgeModule,
  ],
  controllers: [ResumeController],
  providers: [
    {
      provide: RESUME_REPOSITORY,
      useClass: ResumeTypeOrmRepository,
    },
    // Use-cases
    CreateResumeUseCase,
    FindResumeUseCase,
    UpdateResumeTitleUseCase,
    UpdateResumeAboutMeUseCase,
    ListResumesUseCase,
    DeleteResumeUseCase,
    // CoR
    ValidateOwnershipHandler,
    PerformSoftDeleteHandler,
    DeleteResumeChainBuilder,
    // Facade
    ResumeService,
  ],
  exports: [ResumeService, RESUME_REPOSITORY],
})
export class ResumeModule {}
