import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Skill } from 'src/shared/db/entities/skill.entity';
import { Resume } from 'src/resume/entities/resume.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { type SkillPort } from 'src/resume/repositories/sub-resource.repositories';

/**
 * Adapter TypeORM para SkillPort. Maneja find-or-create por nombre en 1
 * round-trip y reemplaza la lista del resume en una sola tx implícita.
 */
@Injectable()
export class SkillTypeOrmRepository implements SkillPort {
  private readonly logger = new StructuredLogger('SkillRepository');

  constructor(
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(Resume)
    private readonly resumeRepo: Repository<Resume>,
  ) {}

  async findOrCreateManyByName(names: string[]): Promise<Skill[]> {
    if (names.length === 0) return [];
    return this.logger.timed('skill.repo.findOrCreate', async () => {
      const existing = await this.skillRepo.find({
        where: { name: In(names) },
      });
      const existingNames = new Set(existing.map((s) => s.name));
      const missing = names.filter((n) => !existingNames.has(n));
      if (missing.length === 0) return existing;

      try {
        await this.skillRepo
          .createQueryBuilder()
          .insert()
          .into('skill')
          .values(missing.map((name) => ({ name })))
          .execute();
      } catch {
        // race condition: otro proceso insertó primero. Releer resuelve.
      }
      return this.skillRepo.find({ where: { name: In(names) } });
    });
  }

  async listByResume(resumeId: number): Promise<Skill[]> {
    return this.logger.timed('skill.repo.listByResume', async () => {
      return this.skillRepo
        .createQueryBuilder('skill')
        .innerJoin('resume_skill', 'rs', 'rs.skillId = skill.id')
        .where('rs.resumeId = :resumeId', { resumeId })
        .select(['skill.id', 'skill.name'])
        .getMany();
    });
  }

  async replaceForResume(input: {
    resumeId: number;
    skills: { id?: number; name: string }[];
  }): Promise<void> {
    return this.logger.timed(
      'skill.repo.replaceForResume',
      async () => {
        const names = input.skills.map((s) => s.name);
        const skills = await this.findOrCreateManyByName(names);

        // Vaciar relaciones existentes.
        await this.resumeRepo
          .createQueryBuilder()
          .delete()
          .from('resume_skill')
          .where('resumeId = :resumeId', { resumeId: input.resumeId })
          .execute();

        // Insertar nuevas relaciones (Many-to-Many via join table).
        if (input.skills.length === 0) return;
        await this.resumeRepo
          .createQueryBuilder()
          .insert()
          .into('resume_skill')
          .values(
            skills.map((sk) => ({
              skillId: sk.id,
              resumeId: input.resumeId,
            })),
          )
          .execute();
      },
      { resumeId: input.resumeId },
    );
  }
}
