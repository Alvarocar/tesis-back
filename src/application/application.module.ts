import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { Application } from './entities/application.entity';
import { BenchmarkRun } from './entities/benchmark-run.entity';
import { Resume } from '../resume/entities/resume.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { LlmClientModule } from 'src/llm-client/llm-client.module';
import { ApplicationListener } from './application.listener';
import { VacancyModule } from 'src/vacancy/vacancy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, BenchmarkRun, Resume, Vacancy]),
    LlmClientModule,
    VacancyModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService, ApplicationListener],
})
export class ApplicationModule {}
