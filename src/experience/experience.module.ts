import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperienceService } from './experience.service';
import { Resume } from 'src/resume/entities/resume.entity';
import { Experience } from 'src/resume/entities/experience.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Experience, Resume])],
  providers: [ExperienceService],
})
export class ExperienceModule {}
