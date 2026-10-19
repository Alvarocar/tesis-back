import { Inject, Injectable } from '@nestjs/common';
import { GEO_REPOSITORY, type GeoRepositoryPort } from '../repositories/geo.repository';

@Injectable()
export class FindDepartmentsUseCase {
  constructor(@Inject(GEO_REPOSITORY) private readonly geoRepo: GeoRepositoryPort) {}

  execute(countryId?: number) {
    return this.geoRepo.findDepartments(countryId);
  }
}
