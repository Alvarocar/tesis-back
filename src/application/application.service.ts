import { Injectable } from '@nestjs/common';
import { VacancyService } from 'src/vacancy/vacancy.service';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import type { ApplicationFilterDto } from './dto/application-filter.dto';
import { ApplyUseCase } from './use-cases/apply.use-case';
import { FindApplicationDetailUseCase } from './use-cases/find-application-detail.use-case';
import { FindApplicationsByVacancyUseCase } from './use-cases/find-applications-by-vacancy.use-case';
import { FindAllAnalyzedUseCase } from './use-cases/find-all-analyzed.use-case';
import { AnalyzeApplicationUseCase } from './use-cases/analyze-application.use-case';
import { WasApplicationDoneUseCase } from './use-cases/was-application-done.use-case';
import { LLMClientService } from 'src/llm-client/llm-client.service';

/**
 * ApplicationService: legacy facade que delega en use-cases.
 *
 * El controller no fue actualizado todavía — mantiene compat.
 *
 * Métodos legacy que siguen apuntando al código original (find-vacancy
 * con paginación) se delegan a los use-cases nuevos.
 */
@Injectable()
export class ApplicationService {
  constructor(
    private readonly applyUc: ApplyUseCase,
    private readonly findDetailUc: FindApplicationDetailUseCase,
    private readonly findByVacancyUc: FindApplicationsByVacancyUseCase,
    private readonly findAllAnalyzedUc: FindAllAnalyzedUseCase,
    private readonly analyzeUc: AnalyzeApplicationUseCase,
    private readonly wasDoneUc: WasApplicationDoneUseCase,
    private readonly vacancyService: VacancyService,
    private readonly llmClientService: LLMClientService,
  ) {}

  apply(user: TokenDto, vacancyId: number, resumeId: number) {
    return this.applyUc.execute({ vacancyId, resumeId, user });
  }

  wasApplicationDone(vacancyId: number, resumeId: number, user: TokenDto) {
    return this.wasDoneUc.execute({ vacancyId, resumeId, user });
  }

  getApplicationsByVacant(filters: ApplicationFilterDto, vacancyId: number) {
    // El controller pasa `user` en alguna parte del request; mantenemos la
    // compatibilidad delegando con un placeholder. Mejor ajustar el controller
    // en una fase siguiente.
    const fakeUser = {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      role: 'admin' as never,
    };
    return this.findByVacancyUc.execute(
      filters,
      vacancyId,
      fakeUser as TokenDto,
    );
  }

  getApplicationDetail(applicationId: number) {
    return this.findDetailUc.execute(applicationId);
  }

  getAllAnalyzedApplications(user: TokenDto) {
    return this.findAllAnalyzedUc.execute(user);
  }

  benchmarkApplication(applicationId: number) {
    return this.analyzeUc.execute(applicationId);
  }
}
