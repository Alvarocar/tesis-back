import { AppDataSource } from '@/data-source';
import { CreateAboutMeDto, ResumeDto } from '@/dtos/resume.dto';
import { Applicant } from '@/models/applicant.model';
import { Resume } from '@/models/resume.model';
import { HttpError } from 'routing-controllers';

const resumeRepository = AppDataSource.getRepository(Resume);

export const ResumeRepository = resumeRepository.extend({
  createFromDto: (dto: ResumeDto): Resume => {
    return ResumeRepository.create({
      about_me: dto.about_me,
      contact_info: dto.contact_info,
      knowledge: dto.knowledge,
    });
  },
  updateAboutme: async (dto: CreateAboutMeDto, applicant: Applicant) => {
    try {
      await ResumeRepository.createQueryBuilder()
      .update()
      .set({
        about_me: dto.about_me
      })
      .where('id = :id', { id: dto.resume_id })
      .andWhere('applicantId = :applicantId', { applicantId: applicant.id })
      .execute()

      return await ResumeRepository.createQueryBuilder('rs').select(['rs.about_me']).where('rs.id = :id', { id: dto.resume_id }).getOneOrFail()
    } catch(e) {
      console.error(e)
      throw new HttpError(500, 'hubo un error')
    }
  },
});
