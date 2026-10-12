import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Language } from '../entities/language.entity';
import { ResumeLanguage } from 'src/resume/entities/resume-language.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  LANGUAGE_REPOSITORY,
  type LanguagePort,
} from 'src/resume/repositories/sub-resource.repositories';

/**
 * Adapter TypeORM para LanguagePort. Reemplaza el flujo antes disperso
 * en LanguageService: bulk search, listar, reemplazar (diff entre
 * current + incoming), get-or-create by name en una sola query (IN).
 */
@Injectable()
export class LanguageTypeOrmRepository implements LanguagePort {
  private readonly logger = new StructuredLogger('LanguageRepository');

  constructor(
    @InjectRepository(Language)
    private readonly langRepo: Repository<Language>,
    @InjectRepository(ResumeLanguage)
    private readonly resumeLangRepo: Repository<ResumeLanguage>,
  ) {}

  async searchByTerm(term: string): Promise<Language[]> {
    return this.logger.timed(
      'language.repo.search',
      async () => {
        const t = `%${term ?? ''}%`;
        return this.langRepo
          .createQueryBuilder('lan')
          .select(['lan.id', 'lan.name'])
          .where('lan.name ILIKE :term', { term: t })
          .getMany();
      },
    );
  }

  async listAll(): Promise<Language[]> {
    return this.langRepo.find({ select: ['id', 'name'], order: { name: 'ASC' } });
  }

  async listByResume(resumeId: number): Promise<
    Array<{ id: number; level: number; name: string }>
  > {
    return this.logger.timed('language.repo.listByResume', async () => {
      const rows = await this.resumeLangRepo
        .createQueryBuilder('rlan')
        .innerJoinAndSelect('rlan.language', 'lang')
        .select(['lang.id AS id', 'rlan.language_level AS level', 'lang.name AS name'])
        .where('rlan.resumeId = :resumeId', { resumeId })
        .getRawMany<{ id: number; level: number; name: string }>();
      return rows.map((r) => ({
        id: Number(r.id),
        level: Number(r.level),
        name: r.name,
      }));
    });
  }

  async findOrCreateManyByName(names: string[]): Promise<Language[]> {
    if (names.length === 0) return [];
    return this.logger.timed('language.repo.findOrCreate', async () => {
      const existing = await this.langRepo.find({
        where: { name: In(names) },
        select: ['id', 'name'],
      });
      const existingNames = new Set(existing.map((e) => e.name));
      const missing = names.filter((n) => !existingNames.has(n));
      if (missing.length === 0) return existing;

      // Insert paralelo-safe: si un insert fuera conflictivo por UNIQUE
      // en `name`, lo capturamos y resolvemos con releer.
      try {
        await this.langRepo
          .createQueryBuilder()
          .insert()
          .into('language')
          .values(missing.map((name) => ({ name })))
          .execute();
      } catch {
        // Race condition: otro proceso creó la fila entre el `existing`
        // y el `INSERT`. Releer resuelve.
      }
      return this.langRepo.find({
        where: { name: In(names) },
        select: ['id', 'name'],
      });
    });
  }

  async replaceForResume(input: {
    resumeId: number;
    languages: { id?: number; name: string; level: number }[];
  }): Promise<void> {
    return this.logger.timed('language.repo.replaceForResume', async () => {
      // 1. Resolver language entities (create nuevo si no existe).
      const languages = await this.findOrCreateManyByName(
        input.languages.map((l) => l.name),
      );
      const byName: Record<string, Language> = {};
      languages.forEach((lang) => (byName[lang.name] = lang));

      // 2. Borrar viejas relaciones del resume.
      await this.resumeLangRepo.delete({ resume: { id: input.resumeId } });

      // 3. Insertar nuevas relaciones.
      if (input.languages.length === 0) return;
      const values = input.languages.map((l) => ({
        languageLevel: l.level,
        language: { id: byName[l.name].id } as ResumeLanguage['language'],
        resume: { id: input.resumeId } as ResumeLanguage['resume'],
      }));
      await this.resumeLangRepo
        .createQueryBuilder()
        .insert()
        .into('resume_language')
        .values(values)
        .execute();
    }, { resumeId: input.resumeId });
  }
}
