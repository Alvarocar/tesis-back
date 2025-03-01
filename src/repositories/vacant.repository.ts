import { AppDataSource } from '@/data-source';
import { Vacant } from '@/models/vacant.model';

export const VacantRepository = AppDataSource.getRepository(Vacant).extend({
  async getDetailById(id: number) {
    return await VacantRepository.createQueryBuilder('vr')
      .select(['vr.id', 'vr.title', 'vr.description', 'vr.experienceYears', 'vr.modificationDate', 'vr.salaryOffer', 'vr.jobType'])
      .where('vr.id = :id', { id })
      .getOneOrFail();
  },
  async getBasicById(id: number) {
    return await VacantRepository.createQueryBuilder('vr').select(['vr.id', 'vr.title']).where('vr.id = :id', { id }).getOneOrFail();
  },
});
