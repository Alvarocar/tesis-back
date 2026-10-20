import { Controller, Get, Query } from '@nestjs/common';
import { FindCountriesUseCase } from './use-cases/find-countries.use-case';
import { FindDepartmentsUseCase } from './use-cases/find-departments.use-case';
import { FindCitiesUseCase } from './use-cases/find-cities.use-case';
import { Param } from '@nestjs/common';

@Controller('v1/geo')
export class GeoController {
  constructor(
    private readonly findCountriesUseCase: FindCountriesUseCase,
    private readonly findDepartmentsUseCase: FindDepartmentsUseCase,
    private readonly findCitiesUseCase: FindCitiesUseCase,
  ) {}

  @Get('countries')
  findCountries() {
    return this.findCountriesUseCase.execute();
  }

  @Get('countries/:id')
  findCountryById(@Param('id') id: string) {
    return this.findCountriesUseCase.findById(Number(id));
  }

  @Get('departments')
  findDepartments(@Query('countryId') countryId?: string) {
    return this.findDepartmentsUseCase.execute(countryId ? Number(countryId) : undefined);
  }

  @Get('departments/:id')
  findDepartmentById(@Param('id') id: string) {
    return this.findDepartmentsUseCase.findById(Number(id));
  }

  @Get('cities')
  findCities(@Query('departmentId') departmentId?: string, @Query('countryId') countryId?: string) {
    if (countryId) return this.findCitiesUseCase.executeByCountry(Number(countryId));
    return this.findCitiesUseCase.execute(departmentId ? Number(departmentId) : undefined);
  }

  @Get('cities/:id')
  findCityById(@Param('id') id: string) {
    return this.findCitiesUseCase.findById(Number(id));
  }
}
