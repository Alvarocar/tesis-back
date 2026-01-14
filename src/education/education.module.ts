import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from 'src/resume/entities/resume.entity';
import { Education } from 'src/resume/entities/education.entity';
import { EducationService } from './education.service';

@Module({
  imports: [TypeOrmModule.forFeature([Resume, Education])],
  providers: [EducationService],
  exports: [EducationService],
})
export class EducationModule {}
