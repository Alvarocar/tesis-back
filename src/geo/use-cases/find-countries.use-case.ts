import { Inject, Injectable } from '@nestjs/common';
import {
  GEO_REPOSITORY,
  type GeoRepositoryPort,
} from '../repositories/geo.repository';

@Injectable()
export class FindCountriesUseCase {
  constructor(
    @Inject(GEO_REPOSITORY) private readonly geoRepo: GeoRepositoryPort,
  ) {}

  execute() {
    return this.geoRepo.findCountries();
  }

  findById(id: number) {
    return this.geoRepo.findCountryById(id);
  }
}
