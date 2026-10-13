import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from 'src/resume/entities/resume.entity';
import { Education } from 'src/resume/entities/education.entity';
import { EducationService } from './education.service';
import { EducationTypeOrmRepository } from './repositories/education.typeorm.repository';
import { EDUCATION_REPOSITORY } from 'src/resume/repositories/sub-resource.repositories';
import { UpsertEducationUseCase } from './use-cases/upsert-education.use-case';
import { DeleteEducationUseCase } from './use-cases/delete-education.use-case';
import { ResumeModule } from 'src/resume/resume.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, Education]),
    forwardRef(() => ResumeModule),
  ],
  providers: [
    {
      provide: EDUCATION_REPOSITORY,
      useClass: EducationTypeOrmRepository,
    },
    UpsertEducationUseCase,
    DeleteEducationUseCase,
    EducationService,
  ],
  exports: [EducationService, EDUCATION_REPOSITORY],
})
export class EducationModule {}
