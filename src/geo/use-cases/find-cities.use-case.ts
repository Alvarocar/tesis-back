import { Inject, Injectable } from '@nestjs/common';
import {
  GEO_REPOSITORY,
  type GeoRepositoryPort,
} from '../repositories/geo.repository';

@Injectable()
export class FindCitiesUseCase {
  constructor(
    @Inject(GEO_REPOSITORY) private readonly geoRepo: GeoRepositoryPort,
  ) {}

  execute(departmentId?: number) {
    return this.geoRepo.findCities(departmentId);
  }

  findById(id: number) {
    return this.geoRepo.findCityById(id);
  }

  executeByCountry(countryId: number) {
    return this.geoRepo.findCitiesByCountry(countryId);
  }
}
