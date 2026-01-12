import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from 'src/resume/entities/resume.entity';
import { Skill } from 'src/shared/entities/skill.entity';
import { SkillService } from './skill.service';

@Module({
  imports: [TypeOrmModule.forFeature([Resume, Skill])],
  providers: [SkillService],
})
export class SkillModule {}
