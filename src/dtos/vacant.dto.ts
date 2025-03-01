import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
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
}

export const VacantFactory = {
  toDto: (vacant: Vacant): VacantDto => {
    return {
      title: vacant.title,
      description: vacant.description,
      jobType: vacant.jobType,
      salary: vacant.salaryOffer,
    };
  },
};
