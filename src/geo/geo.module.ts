import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { Department } from './entities/department.entity';
import { City } from './entities/city.entity';
import { GeoController } from './geo.controller';
import { GEO_REPOSITORY } from './repositories/geo.repository';
import { GeoTypeOrmRepository } from './repositories/geo.typeorm.repository';
import { FindCountriesUseCase } from './use-cases/find-countries.use-case';
import { FindDepartmentsUseCase } from './use-cases/find-departments.use-case';
import { FindCitiesUseCase } from './use-cases/find-cities.use-case';
import { GeoResolver } from './services/geo-resolver.service';

@Module({
  imports: [TypeOrmModule.forFeature([Country, Department, City])],
  controllers: [GeoController],
  providers: [
    { provide: GEO_REPOSITORY, useClass: GeoTypeOrmRepository },
    FindCountriesUseCase,
    FindDepartmentsUseCase,
    FindCitiesUseCase,
    GeoResolver,
  ],
  exports: [GEO_REPOSITORY, GeoResolver],
})
export class GeoModule {}
