import { In, Repository } from 'typeorm';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from './entities/application.entity';
import { ApplicationSearchFactory } from './factory/application-search.factory';
import { ApplicationFilterDto } from './dto/application-filter.dto';
import { ApplicationOverviewDto } from './dto/application-overview.dto';
import { DateUtil } from 'src/shared/utils/date.util';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { Resume } from 'src/resume/entities/resume.entity';
import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { EApplicationStatus } from 'src/shared/enums/application-status.enum';

@Injectable()
export class ApplicationService {

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
  ) {

  }

  async apply(user: TokenDto, vacancyId: number, resumeId: number) {
    const { application: existingApplication, resume, vacancy } = await this.wasApplicationDone(vacancyId, resumeId, user);

    if (existingApplication) {
      throw new ForbiddenException('Application already exists for this resume and vacancy');
    }

    this.applicationRepository.insert({
      resume,
      vacancy,
      status: EApplicationStatus.APPLIED,
      creationDate: new Date(),
    })
 
    // TODO: send notification to analyse the application.

    return true;
  }

  async wasApplicationDone(vacancyId: number, resumeId: number, user: TokenDto) {
    const resumePromise = this.resumeRepository.findOneBy({ id: resumeId, applicant: { id: user.id } });
    const vacancyPromise = this.vacancyRepository.findOneBy({ id: vacancyId });

    const [resume, vacancy] = await Promise.all([resumePromise, vacancyPromise])
  
    if (!resume) {
      throw new NotFoundException('Resume not found or does not belong to the user');
    }
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }

    const application = await this.applicationRepository.findOne({
      where: {
        resume: { id: resume.id },
        vacancy: { id: vacancy.id }
      }
    })

    return { application, resume, vacancy };
  }

  async getApplicationsByVacant(filters: ApplicationFilterDto, vacancyId: number) {
    const [result, count] = await new ApplicationSearchFactory(this.applicationRepository).buildSearchByVacantQuery(vacancyId, filters).getManyAndCount();
    return {
      result: result.map<ApplicationOverviewDto>(item => ({
        id: item.id,
        status: item.status,
        feedBack: item.feedBack,
        affinity: item.affinity,
        creationDate: DateUtil.toString(item.creationDate),
        resume: {
          id: item.resume.id,
        },
        applicant: {
          id: item.resume.applicant.id,
          firstName: item.resume.applicant.firstName,
          lastName: item.resume.applicant.lastName,
        }
      })),
      totalPages: Math.ceil(count / filters.pageSize),
      currentPage: filters.page,
    }
  }
}
