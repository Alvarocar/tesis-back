import { HttpError } from 'routing-controllers';
import { Recruiter } from '@/models/recluter.model';
import { VacantRepository } from '@/repositories/vacant.repository';
import { Singleton } from '@/decorator/singleton.decorator';
import { VacantDto } from '@/dtos/vacant.dto';

@Singleton
export class VacantService {
  async createVacant(vacant: VacantDto, recruiter: Recruiter) {
    const now = new Date();
    try {
      const result = await VacantRepository.insert({
        title: vacant.title,
        description: vacant.description,
        jobType: vacant.jobType,
        salaryOffer: vacant.salary,
        creationDate: now,
        modificationDate: now,
        recruiter,
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
          modificationDate: new Date(),
        })
        .where('id = :id', { id: vacantId })
        .execute();
    } catch (error) {
      console.log('Error: ', error);
      throw new HttpError(500, 'hubo un error al actualizar la vacante');
    }
  }
}

export const vacantService = new VacantService();
