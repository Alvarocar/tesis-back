import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { Application } from './entities/application.entity';
import { Resume } from '../resume/entities/resume.entity';
import { Vacancy } from '../vacancy/entities/vacancy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Resume, Vacancy])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
