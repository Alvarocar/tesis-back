import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../entities/resume.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  type CreateResumeData,
  type ResumeDetailHydrated,
  type ResumeOverviewRow,
  type ResumeRepositoryPort,
  type UpdateResumeData,
} from './resume.repository';

/**
 * Adapter TypeORM para `ResumeRepositoryPort`.
 * - `select` explícito para evitar over-fetch.
 * - Joins selectivos según operación.
 */
@Injectable()
export class ResumeTypeOrmRepository implements ResumeRepositoryPort {
  private readonly logger = new StructuredLogger('ResumeRepository');

  constructor(
    @InjectRepository(Resume)
    private readonly repo: Repository<Resume>,
  ) {}

  async insert(
    data: CreateResumeData & { creationDate: Date },
  ): Promise<Resume> {
    return this.logger.timed(
      'resume.repo.insert',
      async () => {
        const entity = this.repo.create({
          title: data.title,
          experience_years: 0,
          aboutMe: '',
          createDate: data.creationDate,
          modificationDate: data.creationDate,
          applicant: { id: data.applicantId } as Resume['applicant'],
        } as unknown as Resume);
        await this.repo.insert(entity);
        return entity;
      },
      { title: data.title, applicantId: data.applicantId },
    );
  }

  async update(
    id: number,
    applicantId: number,
    data: UpdateResumeData,
  ): Promise<void> {
    await this.logger.timed(
      'resume.repo.update',
      async () => {
        // El filtro por applicantId evita que se actualice un resume ajeno.
        await this.repo.update({ id, applicant: { id: applicantId } }, data);
      },
      { resumeId: id, applicantId },
    );
  }

  async softDelete(id: number, applicantId: number): Promise<void> {
    await this.logger.timed(
      'resume.repo.softDelete',
      async () => {
        // Hard delete con filtro ownership; cascade real lo gestiona la DB.
        await this.repo.delete({ id, applicant: { id: applicantId } });
      },
      { resumeId: id, applicantId },
    );
  }

  async findDetailByIdAndApplicant(
    id: number,
    applicantId: number,
  ): Promise<ResumeDetailHydrated | null> {
    return this.logger.timed(
      'resume.repo.findDetail',
      async () => {
        const qb = this.repo
          .createQueryBuilder('rs')
          .select(['rs.id', 'rs.title', 'rs.aboutMe', 'rs.modificationDate'])
          .leftJoin('rs.applicant', 'app')
          .addSelect(['app.id'])
          .where('rs.id = :id', { id })
          .andWhere('app.id = :applicantId', { applicantId });

        // 7 joins selectivos, todos los selects explícitos:
        qb.leftJoin('rs.educations', 'ed').addSelect([
          'ed.id',
          'ed.institute',
          'ed.keepStudy',
          'ed.startDate',
          'ed.endDate',
          'ed.title',
        ]);
        qb.leftJoin('rs.experiences', 'ex').addSelect([
          'ex.id',
          'ex.rol',
          'ex.company',
          'ex.startDate',
          'ex.endDate',
          'ex.keepWorking',
          'ex.description',
        ]);
        qb.leftJoin('rs.personal_references', 'pr').addSelect([
          'pr.id',
          'pr.name',
          'pr.phoneNumber',
          'pr.relationship',
        ]);
        qb.leftJoin('rs.laboral_references', 'lr').addSelect([
          'lr.id',
          'lr.name',
          'lr.phoneNumber',
          'lr.rol',
        ]);
        qb.leftJoin('rs.resumeLanguage', 'rlan').addSelect([
          'rlan.id',
          'rlan.languageLevel',
        ]);
        qb.leftJoin('rlan.language', 'lang').addSelect([
          'lang.id',
          'lang.name',
        ]);
        qb.leftJoin('rs.skills', 'sk').addSelect(['sk.id', 'sk.name']);
        qb.leftJoin('rs.knowledge', 'kn').addSelect(['kn.id', 'kn.name']);

        const row = await qb.getOne();
        if (!row) return null;

        return {
          id: row.id,
          title: row.title,
          aboutMe: row.aboutMe,
          applicantId: (row.applicant as { id: number }).id,
          workModality: row.workModality ?? null,
          educations: (row.educations ?? []).map((ed) => ({
            id: ed.id,
            institute: ed.institute,
            keepStudy: ed.keepStudy ?? null,
            startDate: ed.startDate,
            endDate: ed.endDate ?? null,
            title: ed.title,
            educationLevel: ed.educationLevel ?? null,
            programName: ed.programName ?? null,
            country: ed.country ?? null,
          })),
          experiences: (row.experiences ?? []).map((ex) => ({
            id: ex.id,
            company: ex.company,
            description: ex.description,
            keepWorking: ex.keepWorking ?? null,
            rol: ex.rol,
            startDate: ex.startDate,
            endDate: ex.endDate ?? null,
            country: ex.country ?? null,
            department: ex.department ?? null,
            city: ex.city ?? null,
          })),
          languages: (row.resumeLanguage ?? [])
            .filter((rl) => rl.language)
            .map((rl) => ({
              id: (rl.language as { id: number }).id,
              level: rl.languageLevel,
              name: (rl.language as { name: string }).name,
            })),
          skills: (row.skills ?? []).map((sk) => ({
            id: sk.id,
            name: sk.name,
          })),
          knowledge: (row.knowledge ?? []).map((kn) => ({
            id: kn.id,
            name: kn.name,
          })),
        } satisfies ResumeDetailHydrated;
      },
      { resumeId: id, applicantId },
    );
  }

  async listOverviewByApplicant(
    applicantId: number,
  ): Promise<ResumeOverviewRow[]> {
    return this.logger.timed(
      'resume.repo.listOverview',
      async () => {
        return this.repo
          .createQueryBuilder('rs')
          .select(['rs.id', 'rs.title', 'rs.aboutMe', 'rs.modificationDate'])
          .leftJoin('rs.applicant', 'app')
          .addSelect(['app.id'])
          .where('app.id = :applicantId', { applicantId })
          .orderBy('rs.modificationDate', 'DESC')
          .getMany();
      },
      { applicantId },
    );
  }

  async existsOwned(id: number, applicantId: number): Promise<boolean> {
    return this.repo.exists({
      where: { id, applicant: { id: applicantId } },
    });
  }

  async validateOwnership(input: {
    resumeId: number;
    applicantId: number;
  }): Promise<boolean> {
    return this.repo.exists({
      where: { id: input.resumeId, applicant: { id: input.applicantId } },
    });
  }
}
