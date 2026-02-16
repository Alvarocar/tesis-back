import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Role } from 'src/shared/enums/role.enum';
import { VacancyStatus } from './enums/vacancy-status.enum';
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
    private readonly vacancyRepository: Repository<Vacancy>,
  ) {}

  public async checkAndUpdateStatus(vacancy: Vacancy): Promise<void> {
    if (
      vacancy.maxApplicantCount !== null &&
      vacancy.applications.length >= vacancy.maxApplicantCount
    ) {
      await this.vacancyRepository.update(vacancy.id, {
        status: VacancyStatus.COMPLETED,
      });
    }
  }

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
      });

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
        editable: true,
      } satisfies CreatedVacancyDto;
    } catch (error) {
      this.logger.error('Error creating vacancy', error);
      throw new InternalServerErrorException('No se pudo crear la vacante');
    }
  }

  async findOne(id: number, user: TokenDto) {
    try {
      const vacancy = await this.vacancyRepository.findOne({
        where: { id, employee: { companyId: user.companyId } },
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
        editable: user.role === Role.Admin || vacancy.employee?.id === user.id,
      } satisfies CreatedVacancyDto;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error fetching vacancies', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las vacantes',
      );
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
    });

    if (Role.Admin) {
      await this.vacancyRepository.update(
        {
          id,
        },
        vacancy,
      );
    } else {
      await this.vacancyRepository.update(
        {
          id,
          employee: { id: user.id },
        },
        vacancy,
      );
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
      editable: user.role === Role.Admin || vacancy.employee?.id === user.id,
    } satisfies CreatedVacancyDto;
  }

  async findAll(
    filters: VacancyFilterDto,
    user: TokenDto,
  ): Promise<[JobOverviewDto[], number]> {
    const [vacancies, count] = await new VacancySearchFactory(
      this.vacancyRepository,
    )
      .buildSearchVacancysQuery(filters, user)
      .getManyAndCount();

    return [
      vacancies.map(
        (vacancy) =>
          ({
            id: vacancy.id,
            title: vacancy.title,
            salary: vacancy.salaryOffer,
            type: vacancy.jobType,
            salaryOffer: vacancy.salaryOffer,
            jobType: vacancy.jobType,
            company: 'UMB',
            editable:
              user.role === Role.Admin || vacancy.employee?.id === user.id,
          }) satisfies JobOverviewDto,
      ),
      count,
    ];
  }

  async findCompletedAndArchivedVacancies(
    filter: { page: number; pageSize: number; statusFilter?: VacancyStatus },
    user: TokenDto,
  ): Promise<[JobOverviewDto[], number]> {
    try {
      if (user.role !== Role.Employee && user.role !== Role.Admin) {
        throw new HttpException('Acceso denegado', 403);
      }

      const queryBuilder = this.vacancyRepository.createQueryBuilder('vacancy');
      if (filter.statusFilter) {
        queryBuilder.where('vacancy.status = :status', {
          status: filter.statusFilter,
        });
      } else {
        queryBuilder.where('vacancy.status IN (:...statuses)', {
          statuses: [VacancyStatus.COMPLETED, VacancyStatus.ARCHIVED],
        });
      }

      queryBuilder
        .skip((filter.page - 1) * filter.pageSize)
        .take(filter.pageSize);

      const [vacancies, count] = await queryBuilder.getManyAndCount();
      const results = vacancies.map(
        (vacancy) =>
          ({
            id: vacancy.id,
            title: vacancy.title,
            salary: vacancy.salaryOffer,
            type: vacancy.jobType,
            salaryOffer: vacancy.salaryOffer,
            jobType: vacancy.jobType,
            status: vacancy.status,
            company: 'UMB',
            editable:
              user.id === vacancy.employee?.id || user.role === Role.Admin,
          }) satisfies JobOverviewDto,
      );

      return [results, count];
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Error fetching completed and archived vacancies',
        error,
      );
      throw new InternalServerErrorException(
        'No se pueden obtener las vacantes completadas o archivadas',
      );
    }
  }

  async archiveVacancy(id: number, user: TokenDto): Promise<void> {
    try {
      // Find vacancy by ID
      const vacancy = await this.vacancyRepository.findOne({
        where: { id },
        relations: ['employee'],
      });

      if (!vacancy) {
        throw new NotFoundException('Vacante no encontrada');
      }

      // Authorization check
      if (
        user.role !== Role.Admin &&
        (!vacancy.employee || vacancy.employee.id !== user.id)
      ) {
        throw new ForbiddenException('Acceso denegado');
      }

      // Update status to ARCHIVED
      await this.vacancyRepository.update(id, {
        status: VacancyStatus.ARCHIVED,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error archiving vacancy', error);
      throw new InternalServerErrorException('No se pudo archivar la vacante');
    }
  }
}
