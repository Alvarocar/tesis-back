import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Education } from 'src/resume/entities/education.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  type EducationPort,
  type EducationUpsertInput,
} from 'src/resume/repositories/sub-resource.repositories';

/**
 * Adapter TypeORM para EducationPort (sub-recurso del Resume).
 * No carga relaciones complejas: solo inserta / valida ownership.
 */
@Injectable()
export class EducationTypeOrmRepository implements EducationPort {
  private readonly logger = new StructuredLogger('EducationRepository');

  constructor(
    @InjectRepository(Education)
    private readonly repo: Repository<Education>,
  ) {}

  async upsert(input: EducationUpsertInput): Promise<Education> {
    return this.logger.timed(
      'education.repo.upsert',
      async () => {
        const entity = this.repo.create({
          id: input.id,
          institute: input.institute,
          title: input.title,
          startDate: input.startDate,
          endDate: input.endDate ?? null,
          keepStudy: input.keepStudy ?? null,
          educationLevel: input.educationLevel ?? null,
          programName: input.programName ?? null,
          countryId: input.countryId ?? null,
          resume: { id: input.resumeId } as Education['resume'],
        } as unknown as Education);
        await this.repo.save(entity);
        return entity;
      },
      { resumeId: input.resumeId, id: input.id },
    );
  }

  async deleteOwned(input: {
    educationId: number;
    resumeId: number;
  }): Promise<boolean> {
    return this.logger.timed(
      'education.repo.deleteOwned',
      async () => {
        const result = await this.repo.delete({
          id: input.educationId,
          resume: { id: input.resumeId },
        });
        return (result.affected ?? 0) > 0;
      },
      { educationId: input.educationId, resumeId: input.resumeId },
    );
  }

  async existsOwned(input: {
    educationId: number;
    resumeId: number;
  }): Promise<boolean> {
    return this.repo.exists({
      where: {
        id: input.educationId,
        resume: { id: input.resumeId },
      },
    });
  }
}
