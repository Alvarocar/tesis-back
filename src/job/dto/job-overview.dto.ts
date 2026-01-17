import { VacancyStatus } from 'src/vacancy/enums/vacancy-status.enum';

export class JobOverviewDto {
  company = 'UMB';
  status?: VacancyStatus;
  id: number;
  title: string;
  salary: number;
  type: string;
  salaryOffer: number;
  jobType: string;
  editable: boolean;
}
