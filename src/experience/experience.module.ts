import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from 'src/resume/entities/resume.entity';
import { Experience } from 'src/resume/entities/experience.entity';
import { ExperienceService } from './experience.service';
import { ExperienceTypeOrmRepository } from './repositories/experience.typeorm.repository';
import { EXPERIENCE_REPOSITORY } from 'src/resume/repositories/sub-resource.repositories';
import { UpsertExperienceUseCase } from './use-cases/upsert-experience.use-case';
import { DeleteExperienceUseCase } from './use-cases/delete-experience.use-case';
import { ResumeModule } from 'src/resume/resume.module';
import { GeoModule } from 'src/geo/geo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experience, Resume]),
    forwardRef(() => ResumeModule),
    GeoModule,
  ],
  providers: [
    {
      provide: EXPERIENCE_REPOSITORY,
      useClass: ExperienceTypeOrmRepository,
    },
    UpsertExperienceUseCase,
    DeleteExperienceUseCase,
    ExperienceService,
  ],
  exports: [ExperienceService, EXPERIENCE_REPOSITORY],
})
export class ExperienceModule {}
