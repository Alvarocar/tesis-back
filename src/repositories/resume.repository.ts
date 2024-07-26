import { AppDataSource } from '@/data-source';
import { CreateAboutMeDto, ResumeDto } from '@/dtos/resume.dto';
import { Resume } from '@/models/resume.model';

const resumeRepository = AppDataSource.getRepository(Resume);

export const ResumeRepository = resumeRepository.extend({
  createFromDto: (dto: ResumeDto): Resume => {
    return ResumeRepository.create({
      about_me: dto.about_me,
      contact_info: dto.contact_info,
      knowledge: dto.knowledge,
    });
  },
  updateAboutme: (dto: CreateAboutMeDto) => {
    return ResumeRepository.update({ id: dto.resume_id }, { about_me: dto.about_me });
    //await dataSource.createQueryBuilder().update(User).set({ firstName: 'Timber', lastName: 'Saw' }).where('id = :id', { id: 1 }).execute();
  },
});
