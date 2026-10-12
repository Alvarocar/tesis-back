import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ApplicationAppliedEvent } from './events/aplication-apply.event';
import { AnalyzeApplicationUseCase } from './use-cases/analyze-application.use-case';

/**
 * Listener de eventos.
 *
 * Al dispararse `application.applied`, delega en `AnalyzeApplicationUseCase`
 * que reusa la query hidratada (1 query en lugar de las 3 que hacía el
 * listener original).
 *
 * Errores se loguean; el listener nunca rompe el flujo del emisor.
 */
@Injectable()
export class ApplicationListener {
  constructor(
    private readonly analyzeUc: AnalyzeApplicationUseCase,
    private readonly logger: StructuredLogger,
  ) {}

  @OnEvent('application.applied')
  async handleApplicationAppliedEvent(
    payload: ApplicationAppliedEvent,
  ): Promise<void> {
    try {
      await this.analyzeUc.execute(payload.applicationId);
    } catch (error) {
      this.logger.error('application.apply.listenerFailed', {
        applicationId: payload.applicationId,
        error: (error as Error).message,
      });
    }
  }
}
