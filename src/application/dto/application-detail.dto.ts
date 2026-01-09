import { ResumeDetailDto } from 'src/resume/dto/resume-detail.dto';
import { VacancyDetailDto } from 'src/vacancy/dto/detail-vacancy.dto';

export class ApplicationDetailDto {
  id: number;

  creationDate: string;

  affinity: number;

  feedBack: string;

  resume: ResumeDetailDto;

  vacancy: VacancyDetailDto;

  applicant: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}
