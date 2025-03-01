import { AppDataSource } from '@/data-source';
import { Vacant } from '@/models/vacant.model';
import { Resume } from '@/models/resume.model';
import { Application } from '@/models/application.model';
import { EApplicationStatus } from '@/enums/application.enum';
import { OllamaResponse } from '@/interfaces/ollama.interface';
import { nanosecondsToSeconds } from '@/utils/number.util';
import { fromStringToJson } from '@/utils/json.util';

export const ApplicationRepository = AppDataSource.getRepository(Application).extend({
  startApply: async (resume: Resume, vacant: Vacant) => {
    return ApplicationRepository.insert({
      createApplicationDate: new Date(),
      resume,
      vacant,
      status: EApplicationStatus.APPLIED,
    });
  },

  endApply: async (id: number, resp: OllamaResponse) => {
    const iaResp = fromStringToJson(resp.response) as { affinity: number; feedback: string };
    return ApplicationRepository.update(
      { id },
      {
        iaTimeTaken: nanosecondsToSeconds(resp.total_duration),
        affinity: iaResp.affinity,
        feedBack: iaResp.feedback,
        status: EApplicationStatus.ANALYZED,
      },
    );
  },

  findByVacantAndResume(vacant: Vacant, resume: Resume) {
    return ApplicationRepository.createQueryBuilder('ap')
      .select(['ap.id', 'ap.resume', 'ap.vacant', 'ap.status'])
      .where('ap.resumeId = :resumeId', { resumeId: resume.id })
      .andWhere('ap.vacantId = :vacantId', { vacantId: vacant.id })
      .getOne();
  },
});
