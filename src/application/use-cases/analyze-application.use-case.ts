import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { EApplicationStatus } from 'src/shared/enums/application-status.enum';
import { LLMClientService } from 'src/llm-client/llm-client.service';
import { APPLY_TEMPLATE_PROMPT } from '../helper/apply-template.helper';
import { VacancyTemplateDto } from '../dto/vacancy-template.dto';
import { ResumeTemplateDto } from '../dto/resume-template.dto';
import {
  APPLICATION_REPOSITORY,
  type ApplicationRepositoryPort,
} from '../repositories/application.repository';

/** Modelo de IA por defecto para análisis. */
const DEFAULT_AI_MODEL_ID = 2;

/**
 * Use-case: analizar una application con la IA.
 * - Toma la application hidratada (1 query) y la pasa a la IA.
 * - Persiste los resultados: affinity, feedback, tiempos, aiModel.
 *
 * Usado por el listener (`OnEvent('application.applied')`) y por el
 * endpoint manual `POST /benchmark/:applicationId`.
 */
@Injectable()
export class AnalyzeApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepo: ApplicationRepositoryPort,
    private readonly llmClient: LLMClientService,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(applicationId: number): Promise<{
    applicationId: number;
    affinity: number;
    feedBack: string;
    inputTokens: number;
    outputTokens: number;
    durationMs: number;
    model: string;
  }> {
    return this.logger.timed(
      'application.analyze',
      async () => {
        const a = await this.applicationRepo.findHydratedForAI(applicationId);
        if (!a) throw new NotFoundError('Application', applicationId);

        const response = await this.llmClient.ask(
          APPLY_TEMPLATE_PROMPT.format(
            new VacancyTemplateDto(
              a.vacancy as unknown as {
                title: string;
                description: string;
              } as never,
            ).getTemplate(),
            new ResumeTemplateDto(
              a.resume as unknown as {
                aboutMe: string;
                experiences: {
                  rol: string;
                  startDate: Date;
                  endDate: Date | null;
                  description: string;
                }[];
                educations: {
                  institute: string;
                  startDate: Date;
                  endDate: Date | null;
                  title: string;
                }[];
                resumeLanguage: {
                  language: { name: string };
                  languageLevel: string;
                }[];
                skills: { name: string }[];
              } as never,
            ).getTemplate(),
          ),
        );

        await this.applicationRepo.updateAnalysisResults(applicationId, {
          affinity: response.content.affinity,
          feedBack: response.content.feedback,
          iaTimeTaken: response.duration,
          status: EApplicationStatus.ANALYZED,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          aiModelId: DEFAULT_AI_MODEL_ID,
        });

        return {
          applicationId,
          affinity: response.content.affinity,
          feedBack: response.content.feedback,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          durationMs: response.duration,
          model: response.model,
        };
      },
      { applicationId },
    );
  }
}
