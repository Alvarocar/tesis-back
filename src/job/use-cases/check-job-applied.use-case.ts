import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import {
  VACANCY_REPOSITORY,
  type VacancyRepositoryPort,
} from 'src/vacancy/repositories/vacancy.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { TokenDto } from 'src/shared/security/dto/token.dto';

/**
 * Verifica si un applicant (Token del rol Applicant) ya aplicó a una vacante.
 */
@Injectable()
export class CheckJobAppliedUseCase {
  constructor(
    @Inject(VACANCY_REPOSITORY)
    private readonly vacancyRepo: VacancyRepositoryPort,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(user: TokenDto, vacancyId: number): Promise<boolean> {
    return this.logger.timed(
      'job.isApplied',
      async () => {
        const vacancy = await this.vacancyRepo.existsById(vacancyId);
        if (!vacancy)
          throw new NotFoundError('Empleo no encontrado', { vacancyId });

        const resumes = await this.dataSource.query(
          'SELECT id FROM resume WHERE applicant_id = $1',
          [user.id],
        );
        const ids = (resumes as Array<{ id: number }>).map((r) => r.id);
        if (ids.length === 0) return false;

        const existing = await this.dataSource.manager
          .createQueryBuilder()
          .select('a.id', 'id')
          .from('application', 'a')
          .where('a.vacancy_id = :vacancyId', { vacancyId })
          .andWhere('a.resume_id IN (:...ids)', { ids })
          .limit(1)
          .getRawOne();

        return existing !== undefined;
      },
      { vacancyId, applicantId: user.id },
    );
  }
}
