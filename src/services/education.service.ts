import { EducationDto } from '@/dtos/resume.dto';
import { Applicant } from '@/models/applicant.model';
import { EducationRepository } from '@/repositories/education.respository';
import { ResumeRepository } from '@/repositories/resume.repository';
import { HttpError } from 'routing-controllers';

export class EducationService {
  async createOrUpdate(study: EducationDto, applicant: Applicant, resumeId: number) {
    try {
      const resume = await ResumeRepository.getBasicInfoById(resumeId, applicant);

      await EducationRepository.createOrEditFromDto(study, resume);
      return EducationRepository.getByResume(resume);
    } catch (error) {
      console.error(error.message);
      throw new HttpError(400, 'hubo un error');
    }
  }

  async deleteEducation(applicant: Applicant, resumeId: number, id: number) {
    try {
      const resume = await ResumeRepository.getBasicInfoById(resumeId, applicant);
      await EducationRepository.createQueryBuilder()
        .delete()
        .where('resume_id = :resumeId', { resumeId: resume.id })
        .andWhere('id = :id', { id })
        .execute();
    } catch (error) {
      console.error(error.message);
      throw new HttpError(400, 'hubo un error');
    }
  }
}
