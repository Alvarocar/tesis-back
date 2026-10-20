import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { EApplicationStatus } from 'src/shared/enums/application-status.enum';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  type ApplicationHydratedForAI,
  type ApplicationRepositoryPort,
  type CreateApplicationData,
  type UpdateAnalysisData,
} from './application.repository';

/**
 * Adapter TypeORM para `ApplicationRepositoryPort`.
 * - `findHydratedForAI`: una sola query con `addSelect` explícitos.
 * - `searchByVacancy`: pagination + select + joins selectivos.
 * - Logging estructurado en cada operación.
 */
@Injectable()
export class ApplicationTypeOrmRepository implements ApplicationRepositoryPort {
  private readonly logger = new StructuredLogger('ApplicationRepository');

  // Implementado por required abstract port (TS quirk)
  Application = Application;

  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
  ) {}

  async insert(data: CreateApplicationData): Promise<{ id: number }> {
    return this.logger.timed(
      'application.repo.insert',
      async () => {
        const entity = this.repo.create({
          resume: { id: data.resumeId } as Application['resume'],
          vacancy: { id: data.vacancyId } as Application['vacancy'],
          status: data.status,
          creationDate: data.creationDate,
        } as unknown as Application);
        await this.repo.insert(entity);
        return { id: entity.id };
      },
      { vacancyId: data.vacancyId, resumeId: data.resumeId },
    );
  }

  async findHydratedForAI(
    applicationId: number,
  ): Promise<ApplicationHydratedForAI | null> {
    return this.logger.timed(
      'application.repo.hydrate',
      async () => {
        const qb = this.repo
          .createQueryBuilder('a')
          .select([
            'a.id',
            'a.status',
            'a.affinity',
            'a.feedBack',
            'a.creationDate',
          ])
          .leftJoin('a.resume', 'rs')
          .addSelect(['rs.id', 'rs.description AS aboutMe', 'rs.title'])
          .leftJoin('rs.applicant', 'app')
          .addSelect([
            'app.id',
            'app.firstName',
            'app.lastName',
            'app.phoneNumber',
          ])
          .leftJoin('rs.educations', 'ed')
          .addSelect([
            'ed.id',
            'ed.title',
            'ed.institute',
            'ed.keepStudy',
            'ed.startDate',
            'ed.endDate',
          ])
          .leftJoin('rs.experiences', 'ex')
          .addSelect([
            'ex.id',
            'ex.rol',
            'ex.company',
            'ex.startDate',
            'ex.endDate',
            'ex.description',
            'ex.keepWorking',
          ])
          .leftJoin('rs.resumeLanguage', 'rlan')
          .addSelect(['rlan.id', 'rlan.languageLevel'])
          .leftJoin('rlan.language', 'lang')
          .addSelect(['lang.id', 'lang.name'])
          .leftJoin('rs.skills', 'sk')
          .addSelect(['sk.id', 'sk.name'])
          .leftJoin('a.vacancy', 'v')
          .addSelect([
            'v.id',
            'v.title',
            'v.description',
            'v.salaryOffer',
            'v.jobType',
            'v.experienceYears',
          ])
          .where('a.id = :id', { id: applicationId });

        const a = await qb.getOne();
        if (!a) return null;

        return {
          id: a.id,
          status: a.status as typeof EApplicationStatus.APPLIED,
          affinity: a.affinity ?? null,
          feedBack: a.feedBack ?? null,
          creationDate: a.creationDate,
          resume: {
            id: (a.resume as { id: number }).id,
            aboutMe: a.resume.aboutMe,
            title: a.resume.title,
            applicant: a.resume
              .applicant as unknown as ApplicationHydratedForAI['resume']['applicant'],
            educations: (a.resume.educations ??
              []) as unknown as ApplicationHydratedForAI['resume']['educations'],
            experiences: (a.resume.experiences ??
              []) as unknown as ApplicationHydratedForAI['resume']['experiences'],
            languages: (a.resume.resumeLanguage ?? []).map(
              (rl) =>
                ({
                  id: rl.id,
                  level: rl.languageLevel,
                  language: rl.language as { id: number; name: string },
                }) as unknown as ApplicationHydratedForAI['resume']['languages'][number],
            ),
            skills: (a.resume.skills ??
              []) as unknown as ApplicationHydratedForAI['resume']['skills'],
          },
          vacancy: {
            id: (a.vacancy as { id: number }).id,
            title: a.vacancy.title,
            description: a.vacancy.description,
            salaryOffer: a.vacancy.salaryOffer ?? null,
            jobType: a.vacancy.jobType,
            experienceYears: a.vacancy.experienceYears ?? null,
          },
        } satisfies ApplicationHydratedForAI;
      },
      { applicationId },
    );
  }

  async searchByVacancy(
    vacancyId: number,
    pagination: { page: number; pageSize: number },
  ) {
    return this.logger.timed(
      'application.repo.searchByVacancy',
      async () => {
        const [data, total] = await this.repo
          .createQueryBuilder('a')
          .select([
            'a.id',
            'a.status',
            'a.feedBack',
            'a.affinity',
            'a.creationDate',
          ])
          .leftJoin('a.resume', 'rs')
          .addSelect(['rs.id'])
          .leftJoin('rs.applicant', 'app')
          .addSelect(['app.id', 'app.firstName', 'app.lastName'])
          .leftJoin('a.vacancy', 'v')
          .addSelect(['v.id', 'v.title'])
          .where('v.id = :vacancyId', { vacancyId })
          .orderBy('a.creationDate', 'DESC')
          .take(pagination.pageSize)
          .skip((pagination.page - 1) * pagination.pageSize)
          .getManyAndCount();
        return { data, total };
      },
      { vacancyId },
    );
  }

  async listAnalyzed() {
    return this.logger.timed(
      'application.repo.listAnalyzed',
      async () => {
        const rows = await this.repo
          .createQueryBuilder('a')
          .select([
            'a.id',
            'a.creationDate',
            'v.title',
            'app.firstName',
            'app.lastName',
          ])
          .leftJoin('a.vacancy', 'v')
          .leftJoin('a.resume', 'rs')
          .leftJoin('rs.applicant', 'app')
          .where('a.status = :status', { status: EApplicationStatus.ANALYZED })
          .orderBy('a.creationDate', 'DESC')
          .getRawMany<{
            a_id: number;
            a_creationDate: Date;
            v_title: string | null;
            app_firstName: string | null;
            app_lastName: string | null;
          }>();
        return rows.map((r) => ({
          id: r.a_id,
          creationDate: r.a_creationDate,
          vacancyTitle: r.v_title ?? '',
          applicantName:
            `${r.app_firstName ?? ''} ${r.app_lastName ?? ''}`.trim(),
        }));
      },
      {},
    );
  }

  async updateAnalysisResults(
    applicationId: number,
    data: UpdateAnalysisData,
  ): Promise<boolean> {
    return this.logger.timed(
      'application.repo.updateAnalysisResults',
      async () => {
        const result = await this.repo
          .createQueryBuilder()
          .update('application')
          .set({
            affinity: data.affinity,
            feedBack: data.feedBack,
            iaTimeTaken: data.iaTimeTaken,
            status: data.status,
            inputTokens: data.inputTokens,
            outputTokens: data.outputTokens,
            aiModel: {
              id: data.aiModelId,
            } as unknown as Application['aiModel'],
          })
          .where('id = :id', { id: applicationId })
          .execute();
        return (result.affected ?? 0) > 0;
      },
      { applicationId },
    );
  }

  async existsForResumeAndVacancy(
    resumeId: number,
    vacancyId: number,
  ): Promise<boolean> {
    return this.repo.exists({
      where: {
        resume: { id: resumeId },
        vacancy: { id: vacancyId },
      },
    });
  }
}
