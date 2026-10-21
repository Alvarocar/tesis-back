import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { Department } from '../entities/department.entity';
import { City } from '../entities/city.entity';
import {
  toCityDto,
  toCountryDto,
  toDepartmentDto,
} from '../mappers/geo-row.mapper';
import type {
  CityDto,
  CountryDto,
  DepartmentDto,
} from '../dto/geo-option.dto';

/**
 * Resolutor de refs geo para los write paths (`PATCH /resume/education`,
 * `PATCH /resume/experience`).
 *
 * A diferencia de `ResumeTypeOrmRepository.loadGeoCatalogs` —que hace batch
 * porque el detalle trae N filas— aca siempre hay una sola fila que
 *刚刚 se guardo. Por eso se resuelve por id directo y se devuelve el DTO
 * plano, no un Map.
 */
@Injectable()
export class GeoResolver {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async country(id: number | null | undefined): Promise<CountryDto | null> {
    if (id == null) return null;
    const row = await this.countryRepo.findOne({ where: { id } });
    return row
      ? toCountryDto({ id: row.id, name: row.name, code: row.code })
      : null;
  }

  async department(
    id: number | null | undefined,
  ): Promise<DepartmentDto | null> {
    if (id == null) return null;
    const row = await this.departmentRepo.findOne({
      where: { id },
      relations: { country: true },
    });
    return row
      ? toDepartmentDto({
          id: row.id,
          name: row.name,
          code: row.code,
          countryId: row.country.id,
        })
      : null;
  }

  async city(id: number | null | undefined): Promise<CityDto | null> {
    if (id == null) return null;
    const row = await this.cityRepo.findOne({
      where: { id },
      relations: { country: true, department: true },
    });
    return row
      ? toCityDto({
          id: row.id,
          name: row.name,
          type: row.type,
          countryId: row.country.id,
          departmentId: row.department.id,
        })
      : null;
  }
}