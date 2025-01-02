import { AMQP_EVENTS } from '@/constants';
import { AMQPService } from './amqp.service';
import { Applicant } from '@/models/applicant.model';
import { ApplicationDto } from '@/dtos/application.dto';
import { VacantRepository } from '@/repositories/vacant.model';
import { ApplicationRepository } from '@/repositories/application.repository';
import { ResumeRepository } from '@/repositories/resume.repository';

export class ApplicationService {
  private amqpService: AMQPService;

  constructor() {
    this.amqpService = new AMQPService(AMQP_EVENTS.APPLICANT.APPLY);
    this.amqpService.init();
  }

  public async apply(application: ApplicationDto, applicant: Applicant) {
    try {
      const resume = await ResumeRepository.getBasicInfoById(application.resumeId, applicant);
      const vacant = await VacantRepository.getBasicById(application.vacantId);

      let incomingApplication = await ApplicationRepository.findByVacantAndResume(vacant, resume);

      if (incomingApplication) throw new Error('application is already done');

      await ApplicationRepository.startApply(resume, vacant);

      incomingApplication = await ApplicationRepository.findByVacantAndResume(vacant, resume);

      const wasPublished = this.amqpService.publish({
        applicationId: incomingApplication.id,
      });

      return wasPublished;
    } catch (e) {
      console.error('[ApplicationService] - Error: ', e.message);
      return false;
    }
  }
}
