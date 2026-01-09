import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    // Verificar si el NIT ya existe
    const existingCompany = await this.companyRepository.findOne({
      where: { nit: createCompanyDto.nit },
    });

    if (existingCompany) {
      throw new ConflictException('El NIT ya está registrado');
    }

    const company = this.companyRepository.create({
      ...createCompanyDto,
      creationDate: new Date(),
      modificationDate: new Date(),
    });

    return await this.companyRepository.save(company);
  }

  async findAll() {
    return await this.companyRepository.find({
      where: { isActive: true },
      relations: ['employees'],
    });
  }

  async findOne(id: number) {
    const company = await this.companyRepository.findOne({
      where: { id, isActive: true },
      relations: ['employees'],
    });

    if (!company) {
      throw new NotFoundException('Compañía no encontrada');
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);

    // Si se está actualizando el NIT, verificar que no exista
    if (updateCompanyDto.nit && updateCompanyDto.nit !== company.nit) {
      const existingCompany = await this.companyRepository.findOne({
        where: { nit: updateCompanyDto.nit },
      });

      if (existingCompany) {
        throw new ConflictException('El NIT ya está registrado');
      }
    }

    Object.assign(company, {
      ...updateCompanyDto,
      modificationDate: new Date(),
    });

    return await this.companyRepository.save(company);
  }

  async remove(id: number) {
    const company = await this.findOne(id);
    company.isActive = false;
    company.modificationDate = new Date();
    await this.companyRepository.save(company);
    return { message: 'Compañía desactivada exitosamente' };
  }

  async findByNit(nit: string) {
    return await this.companyRepository.findOne({
      where: { nit, isActive: true },
    });
  }
}
