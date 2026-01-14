import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Resume } from 'src/resume/entities/resume.entity';
import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import { ApplicationAppliedEvent } from './events/aplication-apply.event';
import { Application } from './entities/application.entity';
import { ResumeFactory } from 'src/resume/factory/resume.factory';
import { LLMClientService } from 'src/llm-client/llm-client.service';
import { APPLY_TEMPLATE_PROMPT } from './helper/apply-template.helper';
import { VacancyTemplateDto } from './dto/vacancy-template.dto';
import { ResumeTemplateDto } from './dto/resume-template.dto';
import { EApplicationStatus } from 'src/shared/enums/application-status.enum';

@Injectable()
export class ApplicationListener {
  private readonly logger = new Logger(ApplicationListener.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly llmClientService: LLMClientService,
  ) {}

  @OnEvent('application.applied')
  async handleApplicationAppliedEvent(payload: ApplicationAppliedEvent) {
    const resume = await new ResumeFactory(this.resumeRepository)
      .getResumeByIdInsecure(payload.resumeId)
      .getOne();
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: payload.vacantId },
    });

    const application = await this.applicationRepository.findOne({
      where: { id: payload.applicationId },
    });

    if (!resume || !vacancy || !application) {
      return;
    }

    try {
      const response = await this.llmClientService.ask(
        APPLY_TEMPLATE_PROMPT.format(
          new VacancyTemplateDto(vacancy).getTemplate(),
          new ResumeTemplateDto(resume).getTemplate(),
        ),
      );

      await this.applicationRepository.update(
        { id: application.id },
        {
          affinity: response.content.affinity,
          feedBack: response.content.feedback,
          iaTimeTaken: response.duration,
          status: EApplicationStatus.ANALYZED,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          aiModel: {
            id: 4, // Mistral 7B Instruct
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `Error processing application ${payload.applicationId}: ${error}`,
      );
    }
  }
}
