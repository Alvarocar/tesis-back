import { AppDataSource } from '@/data-source';
import { SkillDto } from '@/dtos/resume.dto';
import { Resume } from '@/models/resume.model';
import { Skill } from '@/models/skill.model';

export const SkillRepository = AppDataSource.getRepository(Skill).extend({
  getByResume: (resume: Resume) => {
    return SkillRepository.createQueryBuilder('sll').select(['sll.id', 'sll.name']).where('sll.resumeId = :id', { id: resume.id }).getMany();
  },
  deleteFromList: (skills: SkillDto[]) => {
    return Promise.all(skills.map(skill => SkillRepository.createQueryBuilder().delete().where('id = :id', { id: skill.id }).execute()));
  },
  updateFromList: (skills: Required<SkillDto>[]) => {
    return Promise.all(
      skills.map(skill => SkillRepository.createQueryBuilder().update().set({ name: skill.name }).where('id = :id', { id: skill.id }).execute()),
    );
  },
  insertFromList: (skills: SkillDto[], resume: Resume) => {
    return Promise.all(skills.map(skill => SkillRepository.createQueryBuilder().insert().values({ name: skill.name, resume }).execute()));
  },
});
