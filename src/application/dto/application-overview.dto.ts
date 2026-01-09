export class ApplicationOverviewDto {
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
}
