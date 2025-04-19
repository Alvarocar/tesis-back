import { Education } from '@/models/education.model';
import { Experience } from '@/models/experience.model';
import { Resume } from '@/models/resume.model';
import { ResumeLanguage } from '@/models/resume_to_language.model';
import { Skill } from '@/models/skill.model';
import { dateToString } from '@/utils/date.util';
import { purify, window } from '@/utils/dom.util';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class ResumeDto {
  constructor(resume: ResumeDto | undefined) {
    if (!resume) return;
    const { aboutMe, applicantId, educations, experiences, language } = resume;
    this.aboutMe = aboutMe;
    this.applicantId = applicantId;
    this.educations = educations;
    this.experiences = experiences;
    this.language = language;
  }

  @IsString()
  aboutMe: string;

  @IsInt()
  @Min(0)
  applicantId: number;

  @ValidateNested()
  educations: EducationDto[];

  @ValidateNested()
  experiences: ExperienceDto[];

  @ValidateNested()
  language: LanguageDto[];

  public static createFromEntity(entity: Resume) {
    return new ResumeDto({
      aboutMe: entity.aboutMe,
      applicantId: entity.applicant.id,
      educations: entity.educations.map(edu => EducationDto.createFromEntity(edu)),
      experiences: entity.experiences.map(exp => ExperienceDto.createFromEntity(exp)),
      language: entity.resumeLanguage.map(ln => LanguageDto.createFromEntity(ln)),
    });
  }
}
export class CreateAboutMeDto {
  @IsNumber()
  resumeId: number;
  @IsString()
  aboutMe: string;
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
  @Max(4)
  level: number;

  @IsString()
  name: string;

  constructor(language: LanguageDto | undefined) {
    if (!language) return;
    const { id, level, name } = language;
    this.id = id;
    this.level = level;
    this.name = name;
  }

  public static createFromEntity(entity: ResumeLanguage) {
    return new LanguageDto({
      id: entity.id,
      level: entity.languageLevel,
      name: entity.language.name,
    });
  }
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
  startDate: string;

  @IsString()
  @IsOptional()
  endDate: string;

  @IsString()
  description: string;

  @IsBoolean()
  keepWorking: boolean;

  constructor(experience: ExperienceDto | undefined) {
    if (!experience) return;
    const { id, rol, company, startDate, endDate, description, keepWorking } = experience;
    this.id = id;
    this.rol = rol;
    this.company = company;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
    this.keepWorking = keepWorking;
  }

  public static createFromEntity(entity: Experience) {
    return new ExperienceDto({
      id: entity.id,
      rol: entity.rol,
      company: entity.company,
      startDate: dateToString(entity.startDate),
      endDate: entity.endDate ? dateToString(entity.endDate) : null,
      description: entity.description,
      keepWorking: entity.keepWorking,
    });
  }
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
  startDate: string;

  @IsString()
  @IsOptional()
  endDate: string;

  @IsBoolean()
  keepStudy: boolean;

  constructor(edu: EducationDto | undefined) {
    if (!edu) return;
    const { id, institute, title, startDate, endDate, keepStudy } = edu;
    this.id = id;
    this.institute = institute;
    this.title = title;
    this.startDate = startDate;
    this.endDate = endDate;
    this.keepStudy = keepStudy;
  }

  public static createFromEntity(entity: Education) {
    return new EducationDto({
      id: entity.id,
      institute: entity.institute,
      title: entity.title,
      startDate: dateToString(entity.startDate),
      endDate: entity.endDate ? dateToString(entity.endDate) : null,
      keepStudy: entity.keepStudy,
    });
  }
}

export class SkillDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsString()
  name: string;

  constructor(skill: SkillDto | undefined) {
    if (!skill) return;
    const { id, name } = skill;
    this.id = id;
    this.name = name;
  }

  public static createFromEntity(entity: Skill) {
    return new SkillDto({
      id: entity.id,
      name: entity.name,
    });
  }
}

export class ResumeTemplateDto {
  private resume: Resume;

  constructor(resume: Resume) {
    this.resume = resume;
  }

  private getExperiences() {
    const experiences = this.resume.experiences
      ?.map(exp => `\t\t- ${exp.rol} (${exp.startDate}-${exp.endDate ?? 'actual'}) ${exp.description}`)
      ?.join('\n');
    if (!experiences) return '';
    return `\texperiencia:\n${experiences}`;
  }

  private getStudies() {
    const education = this.resume.educations
      ?.map(edu => `\t\t- ${edu.institute} (${edu.startDate}-${edu.endDate ?? 'actual'}) ${edu.title}`)
      ?.join('\n');
    if (!education) return '';
    return `\teducación:\n${education}`;
  }

  private getLanguages() {
    const languages = this.resume.resumeLanguage?.map(ln => `\t\t- ${ln.language.name}: ${ln.languageLevel}`)?.join('\n');
    if (!languages) return '';
    return `\tidioma:\n${languages}`;
  }

  private getSkills() {
    const skills = this.resume.skills?.map(skll => `\t\t- ${skll.name}`);
    if (!skills) return '';
    return `\tHabilidades o Conocimientos:\n${skills}`;
  }

  getDescription() {
    const rawDescription = purify.sanitize(this.resume.aboutMe);
    const container = window.document.createElement('div');
    container.innerHTML = rawDescription;
    return container.textContent ?? '';
  }

  getTemplate() {
    return `
      descripción:
      ${this.getDescription() || 'no hay descripción'}
      ${this.getStudies()}
      ${this.getExperiences()}
      ${this.getLanguages()}
      ${this.getSkills()}
    `;
  }
}
