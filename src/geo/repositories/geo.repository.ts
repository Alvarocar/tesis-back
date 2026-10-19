import type { CityDto, CountryDto, DepartmentDto } from '../dto/geo-option.dto';

export const GEO_REPOSITORY = Symbol('GEO_REPOSITORY');

export interface GeoRepositoryPort {
  findCountries(): Promise<CountryDto[]>;
  findDepartments(countryId?: number): Promise<DepartmentDto[]>;
  findCities(departmentId?: number): Promise<CityDto[]>;
}
