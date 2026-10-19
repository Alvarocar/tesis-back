import { Controller, Get, Query } from '@nestjs/common';
import { FindCountriesUseCase } from './use-cases/find-countries.use-case';
import { FindDepartmentsUseCase } from './use-cases/find-departments.use-case';
import { FindCitiesUseCase } from './use-cases/find-cities.use-case';

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

  @Get('departments')
  findDepartments(@Query('countryId') countryId?: string) {
    return this.findDepartmentsUseCase.execute(countryId ? Number(countryId) : undefined);
  }

  @Get('cities')
  findCities(@Query('departmentId') departmentId?: string) {
    return this.findCitiesUseCase.execute(departmentId ? Number(departmentId) : undefined);
  }
}
