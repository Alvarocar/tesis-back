import { dateToString } from '@/utils/date.util';
import { Application } from '@/models/application.model';
import { ResumeDto } from './resume.dto';
import { VacantDto } from './vacant.dto';

export class ApplicationDto {
  vacantId: number;

  resumeId: number;
}

export class ApplicationVacantDto {
  id: number;
  creationDate: string;
  affinity: number;
  feedBack: string;
  resume: {
    id: number;
  };
  applicant: {
    id: number;
    firstName: string;
    lastName: string;
  };

  constructor({ id, creationDate, affinity, feedBack, resume }: Application) {
    this.id = id;
    this.creationDate = dateToString(creationDate);
    this.affinity = affinity;
    this.feedBack = feedBack;
    this.resume = { id: resume.id };
    this.applicant = { id: resume.applicant.id, firstName: resume.applicant.firstName, lastName: resume.applicant.lastName };
  }

  static fromApplication(application: Application): ApplicationVacantDto {
    return new ApplicationVacantDto(application);
  }
}

export class ApplicationDetailDto {
  id: number;

  creationDate: string;

  affinity: number;

  feedBack: string;

  resume: ResumeDto;

  vacancy: VacantDto;

  constructor({ id, creationDate, affinity, feedBack, resume, vacant }: Application) {
    this.id = id;
    this.creationDate = dateToString(creationDate);
    this.affinity = affinity;
    this.feedBack = feedBack;
    this.resume = ResumeDto.createFromEntity(resume);
    this.vacancy = VacantDto.createFromEntity(vacant);
  }

  public static fromApplication(application: Application): ApplicationDetailDto {
    return new ApplicationDetailDto(application);
  }
}
