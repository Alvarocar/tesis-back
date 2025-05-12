import { HttpError } from 'routing-controllers';
import { Recruiter } from '@/models/recluter.model';
import { VacantRepository } from '@/repositories/vacant.repository';
import { Singleton } from '@/decorator/singleton.decorator';
import { VacantDto } from '@/dtos/vacant.dto';
import { AppDataSource } from '@/data-source';
import { Vacant } from '@/models/vacant.model';
import { GetJobsBuilder } from '@/builder/get-jobs.builder';

@Singleton
export class VacantService {
  async createVacant(vacant: VacantDto, recruiter: Recruiter) {
    try {
      AppDataSource.transaction(async manager => {
        await manager
          .createQueryBuilder()
          .insert()
          .into(Vacant)
          .values({
            title: vacant.title,
            description: vacant.description,
            jobType: vacant.jobType,
            salaryOffer: vacant.salary,
            experienceYears: vacant.experienceYears ?? null,
            recruiter: recruiter,
          })
          .execute();
      });
      const result = await VacantRepository.insert({
        title: vacant.title,
        description: vacant.description,
        jobType: vacant.jobType,
        salaryOffer: vacant.salary,
        recruiter: recruiter,
        experienceYears: vacant.experienceYears ?? null,
      });

      return { id: result.identifiers[0]?.id };
    } catch {
      throw new HttpError(500, 'hubo un error al crear la vacante');
    }
  }

  async getDetail(id: number) {
    try {
      const vacant = await VacantRepository.findOne({
        where: {
          id,
        },
      });
      return vacant;
    } catch (error) {
      console.log('Error: ', error);
      throw new HttpError(500, 'Error interno');
    }
  }

  async updateVacant(vacantId: number, vacant: VacantDto) {
    try {
      await VacantRepository.createQueryBuilder()
        .update()
        .set({
          title: vacant.title,
          description: vacant.description,
          jobType: vacant.jobType,
          salaryOffer: vacant.salary,
          experienceYears: vacant.experienceYears ?? null,
        })
        .where('id = :id', { id: vacantId })
        .execute();
    } catch (error) {
      console.log('Error: ', error);
      throw new HttpError(500, 'hubo un error al actualizar la vacante');
    }
  }

  async getVacantsByRecruiter(recruiter: Recruiter, page: number, size?: number, query = '') {
    const builder = GetJobsBuilder.createBuilder({ fields: { title: true, salaryOffer: true, jobType: true, id: true } }).addPage(page, size);

    builder.addFilter('recruiter', recruiter);

    if (query.trim().length > 0) {
      builder.addSearch(query);
    }

    return builder.build();
  }
}

export const vacantService = new VacantService();
