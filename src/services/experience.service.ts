import { ExperienceDto } from '@/dtos/resume.dto';
import { Applicant } from '@/models/applicant.model';
import { ExperienceRepository } from '@/repositories/experience.repository';
import { ResumeRepository } from '@/repositories/resume.repository';
import { HttpError } from 'routing-controllers';

export class ExperienceService {
  async addOrEdit(experience: ExperienceDto, applicant: Applicant, resumeId: number) {
    try {
      const resume = await ResumeRepository.getBasicInfoById(resumeId, applicant);
      await ExperienceRepository.createOrEditFromDto(experience, resume);
      return ExperienceRepository.getByResume(resume);
    } catch (error) {
      console.error(error.message);
      throw new HttpError(400, 'hubo un error');
    }
  }

  async deleteExperience(applicant: Applicant, resumeId: number, experienceId: number) {
    try {
      const resume = await ResumeRepository.getBasicInfoById(resumeId, applicant);
      await ExperienceRepository.createQueryBuilder()
        .delete()
        .where('resume_id = :resumeId', { resumeId: resume.id })
        .andWhere('id = :id', { id: experienceId })
        .execute();
    } catch (error) {
      console.error(error.message);
      throw new HttpError(400, 'hubo un error');
    }
  }
}
