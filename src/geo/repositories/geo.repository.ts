import type { CityDto, CountryDto, DepartmentDto } from '../dto/geo-option.dto';

export const GEO_REPOSITORY = Symbol('GEO_REPOSITORY');

export interface GeoRepositoryPort {
  findCountries(): Promise<CountryDto[]>;
  findCountryById(id: number): Promise<CountryDto | null>;
  findDepartments(countryId?: number): Promise<DepartmentDto[]>;
  findDepartmentById(id: number): Promise<DepartmentDto | null>;
  findCities(departmentId?: number): Promise<CityDto[]>;
  findCityById(id: number): Promise<CityDto | null>;
  findCitiesByCountry(countryId: number): Promise<CityDto[]>;
}
