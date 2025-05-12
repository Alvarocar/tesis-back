import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Vacant } from '@/models/vacant.model';
import { purify, window } from '@/utils/dom.util';
import { VacantJobType } from '@/enums/vacant.enum';

export class VacantTemplateDto {
  private vacant: Vacant;

  constructor(vacant: Vacant) {
    this.vacant = vacant;
  }

  private getVacantTitle() {
    return this.vacant.title;
  }

  private getVacantDetail() {
    const rawDescription = purify.sanitize(this.vacant.description);
    const container = window.document.createElement('div');
    container.innerHTML = rawDescription;
    return container.textContent ?? '';
  }

  getTemplate() {
    return `
      ${this.getVacantTitle()}
      ${this.getVacantDetail()}
    `;
  }
}

export class VacantDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => purify.sanitize(value))
  description: string;

  @IsNumber()
  @IsPositive()
  salary: number;

  @IsEnum(VacantJobType)
  jobType: VacantJobType;

  @IsNumber()
  @IsOptional()
  experienceYears: number;

  constructor(vacant: VacantDto | undefined) {
    if (!vacant) return;
    const { title, description, jobType, salary, experienceYears } = vacant;
    this.title = title;
    this.description = description;
    this.jobType = jobType;
    this.salary = salary;
    this.experienceYears = experienceYears;
  }

  public static createFromEntity(entity: Vacant) {
    return new VacantDto({
      title: entity.title,
      description: entity.description,
      jobType: entity.jobType,
      salary: entity.salaryOffer,
      experienceYears: entity.experienceYears,
    });
  }
}

export class VacancySkillDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export const VacantFactory = {
  toDto: (vacant: Vacant): VacantDto => {
    return {
      title: vacant.title,
      description: vacant.description,
      jobType: vacant.jobType,
      salary: vacant.salaryOffer,
      experienceYears: vacant.experienceYears,
    };
  },
};
