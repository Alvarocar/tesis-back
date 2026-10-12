import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from 'src/resume/entities/experience.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  EXPERIENCE_REPOSITORY,
  type ExperiencePort,
  type ExperienceUpsertInput,
} from 'src/resume/repositories/sub-resource.repositories';

@Injectable()
export class ExperienceTypeOrmRepository implements ExperiencePort {
  private readonly logger = new StructuredLogger('ExperienceRepository');

  constructor(
    @InjectRepository(Experience)
    private readonly repo: Repository<Experience>,
  ) {}

  async upsert(input: ExperienceUpsertInput): Promise<Experience> {
    return this.logger.timed(
      'experience.repo.upsert',
      async () => {
        const entity = this.repo.create({
          id: input.id,
          company: input.company,
          rol: input.rol,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate ?? null,
          keepWorking: input.keepWorking ?? null,
          resume: { id: input.resumeId } as Experience['resume'],
        } as unknown as Experience);
        await this.repo.save(entity);
        return entity;
      },
      { resumeId: input.resumeId, id: input.id },
    );
  }

  async deleteOwned(input: {
    experienceId: number;
    resumeId: number;
  }): Promise<boolean> {
    return this.logger.timed(
      'experience.repo.deleteOwned',
      async () => {
        const result = await this.repo.delete({
          id: input.experienceId,
          resume: { id: input.resumeId },
        });
        return (result.affected ?? 0) > 0;
      },
      { experienceId: input.experienceId, resumeId: input.resumeId },
    );
  }

  async existsOwned(input: {
    experienceId: number;
    resumeId: number;
  }): Promise<boolean> {
    return this.repo.exists({
      where: {
        id: input.experienceId,
        resume: { id: input.resumeId },
      },
    });
  }
}
