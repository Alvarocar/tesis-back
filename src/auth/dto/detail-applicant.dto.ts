import type {
  CityDto,
  CountryDto,
  DepartmentDto,
} from 'src/geo/dto/geo-option.dto';

export class DetailApplicantDto {
  firstName: string;

  lastName: string;

  email: string;

  creationDate: string;

  modificationDate: string;

  id: number;

  phoneNumber: string;

  birthDate: string;

  direction: string;

  identification: string;

  countryOfBirthId?: number | null;

  departmentOfBirthId?: number | null;

  cityOfBirthId?: number | null;

  countryOfResidenceId?: number | null;

  departmentOfResidenceId?: number | null;

  cityOfResidenceId?: number | null;

  countryOfBirth?: CountryDto | null;

  departmentOfBirth?: DepartmentDto | null;

  cityOfBirth?: CityDto | null;

  countryOfResidence?: CountryDto | null;

  departmentOfResidence?: DepartmentDto | null;

  cityOfResidence?: CityDto | null;

  sex?: string | null;

  genre?: string | null;

  sexualOrientation?: string | null;

  ethnicGroup?: string | null;

  salaryAspiration?: number | null;
}
