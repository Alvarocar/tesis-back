export class CountryDto {
  id: number;
  name: string;
  code: string;
}

export class DepartmentDto {
  id: number;
  name: string;
  code: string;
  countryId: number;
}

export class CityDto {
  id: number;
  name: string;
  type?: string | null;
  countryId: number;
  departmentId: number;
}
