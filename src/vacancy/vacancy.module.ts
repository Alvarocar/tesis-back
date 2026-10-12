import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancyController } from './vacancy.controller';
import { Vacancy } from './entities/vacancy.entity';
import { VacancyTypeOrmRepository } from './repositories/vacancy.typeorm.repository';
import { VACANCY_REPOSITORY } from './repositories/vacancy.repository';
import { CreateVacancyUseCase } from './use-cases/create-vacancy.use-case';
import { FindVacancyUseCase } from './use-cases/find-vacancy.use-case';
import { UpdateVacancyUseCase } from './use-cases/update-vacancy.use-case';
import { ArchiveVacancyUseCase } from './use-cases/archive-vacancy.use-case';
import { SearchVacanciesUseCase } from './use-cases/search-vacancies.use-case';
import { FindCompletedAndArchivedUseCase } from './use-cases/find-completed-and-archived.use-case';
import { CheckAndUpdateVacancyStatusUseCase } from './use-cases/check-and-update-status.use-case';
import { VacancyService } from './vacancy.service';
import {
  LoadAndValidateVacancyHandler,
  UpdateVacancyChainBuilder,
  ValidateOwnershipHandler,
  ValidateStatusTransitionHandler,
} from './chains/update-vacancy.chain';

/**
 * VacancyModule: expone controllers + use-cases + repositorios bajo el port.
 *
 * Estructura:
 *  - `repositories/`: port + adapter TypeORM.
 *  - `use-cases/`: 1 use-case por responsabilidad (SRP).
 *  - `chains/`: CoR para flujos multi-step (validación).
 */
@Module({
  imports: [TypeOrmModule.forFeature([Vacancy])],
  controllers: [VacancyController],
  providers: [
    {
      provide: VACANCY_REPOSITORY,
      useClass: VacancyTypeOrmRepository,
    },
    // Use-cases
    CreateVacancyUseCase,
    FindVacancyUseCase,
    UpdateVacancyUseCase,
    ArchiveVacancyUseCase,
    SearchVacanciesUseCase,
    FindCompletedAndArchivedUseCase,
    CheckAndUpdateVacancyStatusUseCase,
    // Chain of Responsibility handlers
    LoadAndValidateVacancyHandler,
    ValidateOwnershipHandler,
    ValidateStatusTransitionHandler,
    UpdateVacancyChainBuilder,
    // Legacy facade (se elimina al migrar ApplicationModule)
    VacancyService,
  ],
  exports: [
    VACANCY_REPOSITORY,
    CheckAndUpdateVacancyStatusUseCase,
    VacancyService,
  ],
})
export class VacancyModule {}
