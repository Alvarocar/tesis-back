import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { Vacancy } from '../vacancy/entities/vacancy.entity';
import { Resume } from '../resume/entities/resume.entity';
import { Application } from '../application/entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy, Resume, Application])],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
