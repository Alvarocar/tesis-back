import { Repository } from 'typeorm';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Application } from './entities/application.entity';
import { ApplicationSearchFactory } from './factory/application-search.factory';
import { ApplicationFilterDto } from './dto/application-filter.dto';
import { ApplicationOverviewDto } from './dto/application-overview.dto';
import { DateUtil } from 'src/shared/utils/date.util';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { Resume } from 'src/resume/entities/resume.entity';
import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { EApplicationStatus } from 'src/shared/enums/application-status.enum';
import { ApplicationDetailDto } from './dto/application-detail.dto';
import {
  EducationDto,
  ExperienceDto,
  LanguageDto,
  SkillDto,
} from 'src/resume/dto/resume-detail.dto';
import { ApplicationAppliedEvent } from './events/aplication-apply.event';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async apply(user: TokenDto, vacancyId: number, resumeId: number) {
    const {
      application: existingApplication,
      resume,
      vacancy,
    } = await this.wasApplicationDone(vacancyId, resumeId, user);

    if (existingApplication) {
      throw new ForbiddenException(
        'Application already exists for this resume and vacancy',
      );
    }

    const application = this.applicationRepository.create({
      resume,
      vacancy,
      status: EApplicationStatus.APPLIED,
      creationDate: new Date(),
    });

    await this.applicationRepository.save(application);

    this.eventEmitter.emit('application.applied', {
      applicationId: application.id,
      vacantId: vacancyId,
      resumeId: resumeId,
    } satisfies ApplicationAppliedEvent);
    return true;
  }

  async wasApplicationDone(
    vacancyId: number,
    resumeId: number,
    user: TokenDto,
  ) {
    const resumePromise = this.resumeRepository.findOneBy({
      id: resumeId,
      applicant: { id: user.id },
    });
    const vacancyPromise = this.vacancyRepository.findOneBy({ id: vacancyId });

    const [resume, vacancy] = await Promise.all([
      resumePromise,
      vacancyPromise,
    ]);

    if (!resume) {
      throw new NotFoundException(
        'Resume not found or does not belong to the user',
      );
    }
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }

    const application = await this.applicationRepository.findOne({
      where: {
        resume: { id: resume.id },
        vacancy: { id: vacancy.id },
      },
    });

    return { application, resume, vacancy };
  }

  async getApplicationsByVacant(
    filters: ApplicationFilterDto,
    vacancyId: number,
  ) {
    const [result, count] = await new ApplicationSearchFactory(
      this.applicationRepository,
    )
      .buildSearchByVacantQuery(vacancyId, filters)
      .getManyAndCount();
    return {
      result: result.map<ApplicationOverviewDto>((item) => ({
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
        },
      })),
      totalPages: Math.ceil(count / filters.pageSize),
      currentPage: filters.page,
    };
  }

  async getApplicationDetail(applicationId: number): Promise<{
    affinity: number;
    creationDate: string;
    feedBack: string;
    id: number;
    resume: {
      applicantId: number;
      educations: EducationDto[];
      aboutMe: string;
      title: string;
      skills: SkillDto[];
      experiences: ExperienceDto[];
      languages: LanguageDto[];
    };
    vacancy: {
      title: string;
      description: string;
      salary: number;
      jobType: string;
      experienceYears: number;
    };
    applicant: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
    };
  }> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: {
        resume: {
          applicant: true,
          educations: true,
          experiences: true,
          resumeLanguage: { language: true },
          skills: true,
        },
        vacancy: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return {
      affinity: application.affinity,
      creationDate: DateUtil.toString(application.creationDate),
      feedBack: application.feedBack,
      id: application.id,
      resume: {
        applicantId: application.resume.applicant.id,
        educations: application.resume.educations.map<EducationDto>((edu) => ({
          id: edu.id,
          title: edu.title,
          endDate: edu.endDate ? DateUtil.toString(edu.endDate) : null,
          institute: edu.institute,
          keepStudy: edu.keepStudy ?? false,
          startDate: DateUtil.toString(edu.startDate),
        })),
        aboutMe: application.resume.aboutMe,
        title:
          application.resume.applicant.firstName +
          ' ' +
          application.resume.applicant.lastName,
        skills: application.resume.skills,
        experiences: application.resume.experiences.map<ExperienceDto>(
          (exp) => ({
            id: exp.id,
            rol: exp.rol,
            company: exp.company,
            startDate: DateUtil.toString(exp.startDate),
            endDate: exp.endDate ? DateUtil.toString(exp.endDate) : null,
            description: exp.description,
            keepWorking: exp.keepWorking ?? false,
          }),
        ),
        languages: application.resume.resumeLanguage.map<LanguageDto>(
          (lang) => ({
            id: lang.id,
            level: lang.languageLevel,
            name: lang.language.name,
          }),
        ),
      },
      vacancy: {
        title: application.vacancy.title,
        description: application.vacancy.description,
        salary: application.vacancy.salaryOffer,
        jobType: application.vacancy.jobType,
        experienceYears: application.vacancy.experienceYears,
      },
      applicant: {
        firstName: application.resume.applicant.firstName,
        lastName: application.resume.applicant.lastName,
        phoneNumber: application.resume.applicant.phoneNumber,
      },
    } satisfies ApplicationDetailDto;
  }
}
