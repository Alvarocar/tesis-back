import { AppDataSource } from '@/data-source';
import { ResumeDto } from '@/dtos/resume.dto';
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
});
