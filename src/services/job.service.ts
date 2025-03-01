import { In } from 'typeorm';
import { HttpError } from 'routing-controllers';
import { Applicant } from '@/models/applicant.model';
import { Singleton } from '@/decorator/singleton.decorator';
import { ApplicationRepository } from '@/repositories/application.repository';
import { ResumeRepository } from '@/repositories/resume.repository';
import { VacantRepository } from '@/repositories/vacant.repository';

@Singleton
export class JobService {
  async isApplied(user: Applicant, jobId: number) {
    try {
      const jobExists = await VacantRepository.exists({ where: { id: jobId } });

      if (!jobExists) throw new HttpError(404, 'Empleo no encontrado.');

      const resumes = await ResumeRepository.findBy({ applicant: user });
      const resumesIds = resumes.map(res => res.id);
      const exists = await ApplicationRepository.exists({
        where: { resume: { id: In(resumesIds) }, vacant: { id: jobId } },
      });

      return exists;
    } catch (e: HttpError | any) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(400, 'Hubo un error en la solicitud');
    }
  }
}
