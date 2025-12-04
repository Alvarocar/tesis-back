import { CreateVacancyDto } from "./create-vacancy.dto";

export class CreatedVacancyDto extends CreateVacancyDto {
  id: number;
  creationDate: string;
  modificationDate: string;
}