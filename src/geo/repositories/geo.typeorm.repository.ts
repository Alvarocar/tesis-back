import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { Department } from '../entities/department.entity';
import { City } from '../entities/city.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { type GeoRepositoryPort } from './geo.repository';

@Injectable()
export class GeoTypeOrmRepository implements GeoRepositoryPort {
  private readonly logger = new StructuredLogger('GeoRepository');

  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async findCountries() {
    return this.logger.timed('geo.findCountries', async () => {
      const rows = await this.countryRepo.find({ order: { name: 'ASC' } });
      return rows.map((row) => ({ id: row.id, name: row.name, code: row.code }));
    });
  }

  async findDepartments(countryId?: number) {
    return this.logger.timed('geo.findDepartments', async () => {
      const rows = await this.departmentRepo.find({
        where: countryId ? ({ country: { id: countryId } } as never) : undefined,
        relations: { country: true },
        order: { name: 'ASC' },
      });
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        countryId: row.country.id,
      }));
    });
  }

  async findCities(departmentId?: number) {
    return this.logger.timed('geo.findCities', async () => {
      const rows = await this.cityRepo.find({
        where: departmentId ? ({ department: { id: departmentId } } as never) : undefined,
        relations: { country: true, department: true },
        order: { name: 'ASC' },
      });
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type ?? null,
        countryId: row.country.id,
        departmentId: row.department.id,
      }));
    });
  }
}
