import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { JobFilterDto } from './dto/job-filter.dto';
import { JobSearchFactory } from './factory/job-search.factory';
import { JobOverviewPublicDto } from './dto/job-overview-public.dto';
import { Role } from 'src/shared/enums/role.enum';
import { JobOverviewDto } from './dto/job-overview.dto';
import { JobDetailDto } from './dto/job-detail.dto';
import { DateUtil } from 'src/shared/utils/date.util';
import { Resume } from 'src/resume/entities/resume.entity';
import { Application } from 'src/application/entities/application.entity';
import { VacancyStatus } from 'src/vacancy/enums/vacancy-status.enum';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async findAll(
    jobFilterDto: JobFilterDto,
    user?: TokenDto,
  ): Promise<[(JobOverviewDto | JobOverviewPublicDto)[], number]> {
    jobFilterDto.status ??= VacancyStatus.ENABLE;
    const [vacancies, count] = await new JobSearchFactory(
      this.vacancyRepository,
    )
      .buildSearchJobsQuery(jobFilterDto)
      .getManyAndCount();
    if (!user || user.role === Role.Applicant) {
      return [
        vacancies.map(
          (vacancy) =>
            ({
              company: vacancy.employee.company.name,
              id: vacancy.id,
              title: vacancy.title,
              salary: vacancy.salaryOffer,
              type: vacancy.jobType,
              salaryOffer: vacancy.salaryOffer,
              jobType: vacancy.jobType,
              editable: false,
            }) satisfies JobOverviewPublicDto,
        ),
        count,
      ];
    }

    if (user.role === Role.Admin) {
      return [
        vacancies.map(
          (vacancy) =>
            ({
              company: 'UMB',
              id: vacancy.id,
              title: vacancy.title,
              salary: vacancy.salaryOffer,
              type: vacancy.jobType,
              salaryOffer: vacancy.salaryOffer,
              jobType: vacancy.jobType,
              editable: user.companyId === vacancy.employee.companyId,
            }) satisfies JobOverviewDto,
        ),
        count,
      ];
    }

    return [
      vacancies.map(
        (vacancy) =>
          ({
            company: 'UMB',
            id: vacancy.id,
            title: vacancy.title,
            salary: vacancy.salaryOffer,
            type: vacancy.jobType,
            salaryOffer: vacancy.salaryOffer,
            jobType: vacancy.jobType,
            editable: user.id === vacancy.employee.id,
          }) satisfies JobOverviewDto,
      ),
      count,
    ];
  }

  async findOne(id: number) {
    try {
      const job = await new JobSearchFactory(this.vacancyRepository)
        .buildByIdQuery(id)
        .getOneOrFail();
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        experienceYears: job.experienceYears,
        salaryOffer: job.salaryOffer,
        modificationDate: DateUtil.toString(job.modificationDate),
        jobType: job.jobType,
      } satisfies JobDetailDto;
    } catch (error) {
      this.logger.error(`Job with id ${id} not found`, (error as Error).stack);
      throw new NotFoundException('Job not found');
    }
  }

  async isApplied(user: TokenDto, vacancyId: number): Promise<boolean> {
    try {
      let exists = await this.vacancyRepository.exists({
        where: { id: vacancyId },
      });
      if (!exists) throw new NotFoundException('Empleo no encontrado');

      const resumes = await this.resumeRepository.findBy({
        applicant: { id: user.id },
      });

      exists = await this.applicationRepository.exists({
        where: {
          vacancy: { id: vacancyId },
          resume: { id: In(resumes.map((r) => r.id)) },
        },
      });

      return exists;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Job with id ${vacancyId} not found`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Error para procesar la solicitud',
      );
    }
  }
}
