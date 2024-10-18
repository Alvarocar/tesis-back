import { SkillDto } from '@/dtos/resume.dto';
import { Applicant } from '@/models/applicant.model';
import { ResumeRepository } from '@/repositories/resume.repository';
import { SkillRepository } from '@/repositories/skill.repository';

export class SkillService {
  async updateSkills(skills: SkillDto[], resumeId: number, applicant: Applicant) {
    const commingIds = skills.filter(skill => skill.id !== undefined).map(lng => lng.id);
    try {
      const resume = await ResumeRepository.getBasicInfoById(resumeId, applicant);
      const currentSkills = await SkillRepository.getByResume(resume);
      const preparedSkills = currentSkills.reduce(
        (acc, current) => {
          if (commingIds.includes(current.id)) {
            return {
              ...acc,
              toUpdate: [...acc.toUpdate, current],
            };
          }

          return {
            ...acc,
            toRemove: [...acc.toRemove, current],
          };
        },
        { toRemove: [], toUpdate: [], toCreate: skills.filter(lng => lng.id === undefined) },
      );

      const deletePromise = SkillRepository.deleteFromList(preparedSkills.toRemove);
      const updatedPromise = SkillRepository.updateFromList(preparedSkills.toUpdate);
      const insertedPromise = SkillRepository.insertFromList(preparedSkills.toCreate, resume);
      await Promise.all([deletePromise, updatedPromise, insertedPromise]);
      return SkillRepository.getByResume(resume);
    } catch (error) {
      console.error(error);
    }
  }
}
