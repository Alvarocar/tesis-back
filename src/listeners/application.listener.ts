import { AMQP_EVENTS } from '../constants/amqp.constants';
import { BaseListener } from './base.listener';
import { ApplicationRepository } from '@/repositories/application.repository';
import { AMQPService } from '@/services/amqp.service';
import { VacantTemplateDto } from '@/dtos/vacant.dto';
import { ResumeTemplateDto } from '@/dtos/resume.dto';
import { LLMChain } from 'langchain/chains';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { APPLY_TEMPLATE_PROMPT } from '@/ai/templates/apply.template';
import { ollamaLLM } from '@/ai/model/gemma.model';
import { RecluterIA } from '@/classes/recluter.class';
import { ResumeRepository } from '@/repositories/resume.repository';

export class ApplicationListener extends BaseListener {
  topic = AMQP_EVENTS.APPLICANT.APPLY;
  private amqpService: AMQPService;
  private iaService: RecluterIA;

  constructor() {
    super();
    this.amqpService = new AMQPService(this.topic);
    this.iaService = new RecluterIA('http://localhost:11434');
  }

  async init() {
    console.log('[Applicant Apply] start initialization');
    await this.amqpService.init();
    const channel = this.amqpService.getChannel();
    this.consume(channel);
  }

  async handleMessage(msg: string) {
    console.log(`[ApplicantApplyListener] Recibido: ${msg}`);
    const applicationMSG = JSON.parse(msg) as { applicationId: number };
    if (!applicationMSG.applicationId) {
      console.error(`[ApplicantApplyListener] FAIL: application id doesn't found`);
      return null;
    }

    const application = await ApplicationRepository.findOneOrFail({
      where: { id: applicationMSG.applicationId },
      relations: ['vacant', 'resume'],
    });

    const resume = await ResumeRepository.getFullByIdNoSecure(application.resume.id);

    const vacantDto = new VacantTemplateDto(application.vacant);

    const resumeDto = new ResumeTemplateDto(resume);

    const prompt = await APPLY_TEMPLATE_PROMPT.format({
      vacant: vacantDto.getTemplate(),
      cv: resumeDto.getTemplate(),
    });

    const response = await this.iaService.generate(prompt);

    console.log(response);
  }
}
