import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Knowledge } from 'src/shared/db/entities/knowledge.entity';
import { Resume } from 'src/resume/entities/resume.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { type KnowledgePort } from 'src/resume/repositories/sub-resource.repositories';

/**
 * Adapter TypeORM para KnowledgePort. Mismo contrato que `SkillPort`:
 * find-or-create por nombre y reemplazo de la lista completa del resume.
 *
 * Reutiliza la metadata de la relacion `knowledge` en vez de la tabla
 * cruda `resume_knowledge`, para que los nombres de columna de la tabla
 * junction los resuelva TypeORM desde el `@JoinTable` de la entidad.
 */
@Injectable()
export class KnowledgeTypeOrmRepository implements KnowledgePort {
  private readonly logger = new StructuredLogger('KnowledgeRepository');

  constructor(
    @InjectRepository(Knowledge)
    private readonly knowledgeRepo: Repository<Knowledge>,
    @InjectRepository(Resume)
    private readonly resumeRepo: Repository<Resume>,
  ) {}

  async findOrCreateManyByName(names: string[]): Promise<Knowledge[]> {
    if (names.length === 0) return [];
    return this.logger.timed('knowledge.repo.findOrCreate', async () => {
      const existing = await this.knowledgeRepo.find({
        where: { name: In(names) },
      });
      const existingNames = new Set(existing.map((k) => k.name));
      const missing = names.filter((n) => !existingNames.has(n));
      if (missing.length === 0) return existing;

      try {
        await this.knowledgeRepo
          .createQueryBuilder()
          .insert()
          .into('knowledge')
          .values(missing.map((name) => ({ name })))
          .execute();
      } catch {
        // race condition: `idx_knowledge_name` es unico y otro proceso
        // pudo insertar primero. Releer resuelve.
      }
      return this.knowledgeRepo.find({ where: { name: In(names) } });
    });
  }

  async listByResume(resumeId: number): Promise<Knowledge[]> {
    return this.logger.timed('knowledge.repo.listByResume', async () => {
      const resume = await this.resumeRepo.findOne({
        where: { id: resumeId },
        relations: { knowledge: true },
      });
      return resume?.knowledge ?? [];
    });
  }

  async replaceForResume(input: {
    resumeId: number;
    knowledge: { id?: number; name: string }[];
  }): Promise<void> {
    return this.logger.timed(
      'knowledge.repo.replaceForResume',
      async () => {
        const names = input.knowledge.map((k) => k.name);
        const knowledge = await this.findOrCreateManyByName(names);

        const resume = await this.resumeRepo.findOne({
          where: { id: input.resumeId },
        });
        if (!resume) return;

        resume.knowledge = knowledge;
        await this.resumeRepo.save(resume);
      },
      { resumeId: input.resumeId },
    );
  }
}