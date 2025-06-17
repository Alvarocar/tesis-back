import { AppDataSource } from '@/data-source';
import { Vacant } from '@/models/vacant.model';
import { Resume } from '@/models/resume.model';
import { Application } from '@/models/application.model';
import { EApplicationStatus } from '@/enums/application.enum';

export const ApplicationRepository = AppDataSource.getRepository(Application).extend({
  startApply: async (resume: Resume, vacant: Vacant) => {
    return ApplicationRepository.insert({
      creationDate: new Date(),
      resume,
      vacant,
      status: EApplicationStatus.APPLIED,
    });
  },

  endApply: async (id: number, affinity: number, feedBack: string, timeTaken: number) => {
    return ApplicationRepository.update(
      { id },
      {
        affinity: affinity,
        feedBack: feedBack,
        iaTimeTaken: timeTaken,
        status: EApplicationStatus.ANALYZED,
      },
    );
  },

  findByVacantAndResume(vacant: Vacant, resume: Resume) {
    return ApplicationRepository.createQueryBuilder('ap')
      .select(['ap.id', 'ap.resume', 'ap.vacant', 'ap.status'])
      .where('ap.resume_id = :resumeId', { resumeId: resume.id })
      .andWhere('ap.vacancy_id = :vacancyId', { vacancyId: vacant.id })
      .getOne();
  },
});
