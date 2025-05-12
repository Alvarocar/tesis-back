import { AmqpService } from './amqp.service';
import { Applicant } from '@/models/applicant.model';
import { ApplicationDetailDto, ApplicationDto, ApplicationVacantDto } from '@/dtos/application.dto';
import { VacantRepository } from '@/repositories/vacant.repository';
import { ApplicationRepository } from '@/repositories/application.repository';
import { ResumeRepository } from '@/repositories/resume.repository';
import { EApplicationStatus } from '@/enums/application.enum';
import { ILike } from 'typeorm';
import { NotFoundError } from 'routing-controllers';

export class ApplicationService {
  private amqpService: AmqpService;

  constructor() {
    this.amqpService = new AmqpService();
  }

  public async apply(application: ApplicationDto, applicant: Applicant) {
    try {
      const resume = await ResumeRepository.getBasicInfoById(application.resumeId, applicant);
      const vacant = await VacantRepository.getBasicById(application.vacantId);

      let incomingApplication = await ApplicationRepository.findByVacantAndResume(vacant, resume);

      if (incomingApplication) throw new Error('application is already done');

      await ApplicationRepository.startApply(resume, vacant);

      incomingApplication = await ApplicationRepository.findByVacantAndResume(vacant, resume);

      await this.amqpService.publish('applicant.apply', {
        applicationId: incomingApplication.id,
        vacantId: vacant.id,
        applicantId: applicant.id,
        resumeId: resume.id,
      });

      return true;
    } catch (e) {
      console.error('[ApplicationService] - Error: ', e.message);
      return false;
    }
  }

  public async getApplicationsByVacant(vacantId: number, page = 1, pageSize = 10, query: string) {
    const vacant = await VacantRepository.getBasicById(vacantId);
    const [results, total] = await ApplicationRepository.findAndCount({
      select: {
        affinity: true,
        feedBack: true,
        id: true,
        resume: {
          id: true,
          applicant: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      where: {
        vacant: {
          id: vacant.id,
          title: query.trim().length > 0 ? ILike(`%${query}%`) : undefined,
          description: query.trim().length > 0 ? ILike(`%${query}%`) : undefined,
        },
        status: EApplicationStatus.ANALYZED,
      },
      order: {
        affinity: 'DESC',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['vacant', 'resume', 'resume.applicant'],
    });
    return {
      result: results.map(application => ApplicationVacantDto.fromApplication(application)),
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  }

  public async isApplicationDone(vacantId: number, resumeId: number, applicant: Applicant) {
    try {
      const resume = await ResumeRepository.getBasicInfoById(resumeId, applicant);
      const vacant = await VacantRepository.getBasicById(vacantId);
      const application = await ApplicationRepository.findByVacantAndResume(vacant, resume);
      return { isDone: !!application };
    } catch (e) {
      console.error('[ApplicationService] - Error: ', e.message);
      return { isDone: false };
    }
  }

  public async getApplicationDetail(applicationId: number) {
    const application = await ApplicationRepository.findOne({
      where: {
        id: applicationId,
      },
      relations: [
        'vacant',
        'resume',
        'resume.applicant',
        'resume.skills',
        'resume.resumeLanguage',
        'resume.resumeLanguage.language',
        'resume.educations',
        'resume.experiences',
      ],
    });
    if (!application) throw new NotFoundError('La solicitud no fue encontrada');
    return ApplicationDetailDto.fromApplication(application);
  }
}
