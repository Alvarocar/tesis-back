import { IsInt, IsString } from 'class-validator';
import { Resume } from '@/models/resume.model';

export class ResumeOverviewDto {
  constructor(resume: Resume) {
    this.id = resume.id;
    this.title = resume.title;
    this.aboutMe = resume.aboutMe;
  }

  @IsInt()
  id: number;

  @IsString()
  title: string;

  @IsString()
  aboutMe: string;
}
