import { IAmqpEvents } from '@/types/amqp';
import { VacantTemplateDto } from '@/dtos/vacant.dto';
import { ResumeTemplateDto } from '@/dtos/resume.dto';
import { VacantRepository } from '@/repositories/vacant.repository';
import { ResumeRepository } from '@/repositories/resume.repository';
import { APPLY_TEMPLATE_PROMPT } from '@/ai/templates/apply.template';
import { ApplicationRepository } from '@/repositories/application.repository';
import { BaseListener } from './base.listener';
import { AIService } from '@/services/ai.service';
import { getResponseFromModel } from '@/utils/getFromModel.util';

export class ApplicationListener extends BaseListener<'applicant.apply'> {
  topic = 'applicant.apply' as const;
  private iaService: AIService;

  constructor() {
    super();
    this.iaService = new AIService();
  }

  async init() {
    console.log('[Applicant Apply] start initialization');
    this.consume(this.topic);
  }

  async handleMessage(msg: IAmqpEvents['applicant.apply']['input']) {
    console.log(`[ApplicantApplyListener] Recibido: ${msg}`);
    if (!msg.applicationId) {
      console.error(`[ApplicantApplyListener] FAIL: application id doesn't found`);
      return;
    }

    const { resumeId, vacantId, applicationId } = msg;

    const resume = await ResumeRepository.getFullByIdNoSecure(resumeId);

    const vacant = await VacantRepository.getDetailById(vacantId);

    const vacantDto = new VacantTemplateDto(vacant);

    const resumeDto = new ResumeTemplateDto(resume);

    const prompt = APPLY_TEMPLATE_PROMPT.format(vacantDto.getTemplate(), resumeDto.getTemplate());

    const response = await this.iaService.generate(prompt);
    console.log(response.text);
    const { affinity, feedback } = await getResponseFromModel(response.text);
    await ApplicationRepository.endApply(applicationId, affinity, feedback);
  }
}
