import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Role } from 'src/shared/enums/role.enum';
import { DateUtil } from 'src/shared/utils/date.util';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { JobOverviewDto } from 'src/job/dto/job-overview.dto';
import { Vacancy } from './entities/vacancy.entity';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacancyFilterDto } from './dto/vacancy-filter.dto';
import { CreatedVacancyDto } from './dto/created-vacancy.dto';
import { VacancySearchFactory } from './factory/vacancy-search.factory';

@Injectable()
export class VacancyService {

  private readonly logger = new Logger(VacancyService.name);

  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>
  ) { }

  async create(createVacancyDto: CreateVacancyDto, user: TokenDto) {
    try {
      const vacancy = this.vacancyRepository.create({
        creationDate: new Date(),
        modificationDate: new Date(),
        description: createVacancyDto.description,
        experienceYears: createVacancyDto.experienceYears,
        jobType: createVacancyDto.jobType,
        salaryOffer: createVacancyDto.salary,
        title: createVacancyDto.title,
        employee: { id: user.id },
      })

      await this.vacancyRepository.insert(vacancy);

      return {
        id: vacancy.id,
        title: vacancy.title,
        jobType: vacancy.jobType,
        salary: vacancy.salaryOffer,
        description: vacancy.description,
        experienceYears: vacancy.experienceYears,
        creationDate: DateUtil.toString(vacancy.creationDate),
        modificationDate: DateUtil.toString(vacancy.modificationDate),
      } satisfies CreatedVacancyDto;
    } catch (error) {
      this.logger.error('Error creating vacancy', error);
      throw new InternalServerErrorException('No se pudo crear la vacante');
    }
  }

  async findOne(id: number) {
    try {

      const vacancy = await this.vacancyRepository.findOne({
        where: { id },
      });

      if (!vacancy) throw new NotFoundException('Vacante no encontrada');

      return {
        creationDate: DateUtil.toString(vacancy.creationDate),
        description: vacancy.description,
        experienceYears: vacancy.experienceYears,
        id: vacancy.id,
        jobType: vacancy.jobType,
        modificationDate: DateUtil.toString(vacancy.modificationDate),
        salary: vacancy.salaryOffer,
        title: vacancy.title,
      } satisfies CreatedVacancyDto;

    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error fetching vacancies', error);
      throw new InternalServerErrorException('No se pudieron obtener las vacantes');
    }
  }

  async update(id: number, updateVacancyDto: UpdateVacancyDto, user: TokenDto) {

    const vacancy = this.vacancyRepository.create({
      id,
      description: updateVacancyDto.description,
      experienceYears: updateVacancyDto.experienceYears,
      jobType: updateVacancyDto.jobType,
      salaryOffer: updateVacancyDto.salary,
      title: updateVacancyDto.title,
      modificationDate: new Date(),
    })

    if (Role.Admin) {
      await this.vacancyRepository.update({
        id,
      }, vacancy);
    } else {
      await this.vacancyRepository.update({
        id,
        employee: { id: user.id },
      }, vacancy);
    }

    return {
      creationDate: DateUtil.toString(vacancy.creationDate),
      description: vacancy.description,
      experienceYears: vacancy.experienceYears,
      id: vacancy.id,
      jobType: vacancy.jobType,
      modificationDate: DateUtil.toString(vacancy.modificationDate),
      salary: vacancy.salaryOffer,
      title: vacancy.title,
    } satisfies CreatedVacancyDto;
  }

  async findAll(filters: VacancyFilterDto, user: TokenDto) {
    const [vacancies, count] =  await new VacancySearchFactory(this.vacancyRepository).buildSearchVacancysQuery(filters, user).getManyAndCount();
    return [vacancies.map(vacancy => ({
      id: vacancy.id,
      title: vacancy.title,
      salary: vacancy.salaryOffer,
      type: vacancy.jobType,
      salaryOffer: vacancy.salaryOffer,
      jobType: vacancy.jobType,
      company: 'UMB',
      editable: true,
      } satisfies JobOverviewDto)), count];

  }

  remove(id: number) {
    return `This action removes a #${id} vacancy`;
  }
}
