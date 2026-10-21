import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { BenchmarkRun } from './entities/benchmark-run.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { Resume } from '../resume/entities/resume.entity';
import { Country } from 'src/geo/entities/country.entity';
import { Department } from 'src/geo/entities/department.entity';
import { City } from 'src/geo/entities/city.entity';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationListener } from './application.listener';
import { LlmClientModule } from 'src/llm-client/llm-client.module';
import { VacancyModule } from 'src/vacancy/vacancy.module';
import { ResumeModule } from 'src/resume/resume.module';
import { APPLICATION_REPOSITORY } from './repositories/application.repository';
import { ApplicationTypeOrmRepository } from './repositories/application.typeorm.repository';
import { ApplyUseCase } from './use-cases/apply.use-case';
import { FindApplicationDetailUseCase } from './use-cases/find-application-detail.use-case';
import { FindApplicationsByVacancyUseCase } from './use-cases/find-applications-by-vacancy.use-case';
import { FindAllAnalyzedUseCase } from './use-cases/find-all-analyzed.use-case';
import { AnalyzeApplicationUseCase } from './use-cases/analyze-application.use-case';
import { WasApplicationDoneUseCase } from './use-cases/was-application-done.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      BenchmarkRun,
      Resume,
      Vacancy,
      Country,
      Department,
      City,
    ]),
    LlmClientModule,
    VacancyModule,
    ResumeModule,
  ],
  controllers: [ApplicationController],
  providers: [
    {
      provide: APPLICATION_REPOSITORY,
      useClass: ApplicationTypeOrmRepository,
    },
    // Use-cases
    ApplyUseCase,
    FindApplicationDetailUseCase,
    FindApplicationsByVacancyUseCase,
    FindAllAnalyzedUseCase,
    AnalyzeApplicationUseCase,
    WasApplicationDoneUseCase,
    // Service legacy + listener
    ApplicationService,
    ApplicationListener,
  ],
})
export class ApplicationModule {}
