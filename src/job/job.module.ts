import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { VacancyModule } from 'src/vacancy/vacancy.module';
import { SearchJobsUseCase } from './use-cases/search-jobs.use-case';
import { FindJobDetailUseCase } from './use-cases/find-job-detail.use-case';
import { CheckJobAppliedUseCase } from './use-cases/check-job-applied.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy]), forwardRef(() => VacancyModule)],
  controllers: [JobController],
  providers: [
    SearchJobsUseCase,
    FindJobDetailUseCase,
    CheckJobAppliedUseCase,
    JobService,
  ],
  exports: [JobService],
})
export class JobModule {}
