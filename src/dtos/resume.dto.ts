import { Resume } from '@/models/resume.model';
import { purify, window } from '@/utils/dom.util';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class ResumeDto {
  @IsString()
  knowledge: string;

  @IsString()
  contact_info: string;

  @IsString()
  about_me: string;

  @IsInt()
  @Min(0)
  applicant_id: number;

  @ValidateNested()
  educations: EducationDto[];

  @ValidateNested()
  experiences: ExperienceDto[];

  @ValidateNested()
  language: LanguageDto[];
}
export class CreateAboutMeDto {
  @IsNumber()
  resume_id: number;
  @IsString()
  about_me: string;
}

export class CreateResumeDto {
  @IsString()
  @MaxLength(60)
  title: string;
}

export class LanguageDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  id?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  level: number;

  @IsString()
  name: string;
}

export class ExperienceDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  rol: string;

  @IsString()
  company: string;

  @IsString()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date: string;

  @IsString()
  description: string;

  @IsBoolean()
  keep_working: boolean;
}

export class EducationDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  institute: string;

  @IsString()
  title: string;

  @IsString()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date: string;

  @IsBoolean()
  keep_study: boolean;
}

export class SkillDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  name: string;
}

export class ResumeTemplateDto {
  private resume: Resume;

  constructor(resume: Resume) {
    this.resume = resume;
  }

  private getExperiences() {
    const experiences = this.resume.experiences
      ?.map(exp => `\t\t- ${exp.rol} (${exp.start_date}-${exp.end_date ?? 'actual'}) ${exp.description}`)
      ?.join('\n');
    if (!experiences) return '';
    return `\texperiencia:\n${experiences}`;
  }

  private getStudies() {
    const education = this.resume.educations
      ?.map(edu => `\t\t- ${edu.institute} (${edu.start_date}-${edu.end_date ?? 'actual'}) ${edu.title}`)
      ?.join('\n');
    if (!education) return '';
    return `\teducación:\n${education}`;
  }

  private getLanguages() {
    const languages = this.resume.resumeToLanguage?.map(ln => `\t\t- ${ln.language.name}: ${ln.language_level}`)?.join('\n');
    if (!languages) return '';
    return `\tidioma:\n${languages}`;
  }

  private getSkills() {
    const skills = this.resume.skills?.map(skll => `\t\t- ${skll.name}`);
    if (!skills) return '';
    return `\tHabilidades o Conocimientos:\n${skills}`;
  }

  /*   getDescription() {
    const rawDescription = purify.sanitize(this.resume.about_me);
    const container = window.document.createElement('div');
    container.innerHTML = rawDescription;
    return container.textContent ?? '';
  }
 */
  getTemplate() {
    return `
      descripción:
      ${this.resume.about_me || 'no hay descripción'}
      ${this.getStudies()}
      ${this.getExperiences()}
      ${this.getLanguages()}
      ${this.getSkills()}
    `;
  }
}
