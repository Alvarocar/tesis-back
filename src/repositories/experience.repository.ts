import { AppDataSource } from '@/data-source';
import { ExperienceDto } from '@/dtos/resume.dto';
import { Experience } from '@/models/experience.model';
import { Resume } from '@/models/resume.model';
import { stringToDate } from '@/utils/date.util';
import { omit } from 'lodash';

export const ExperienceRepository = AppDataSource.getRepository(Experience).extend({
  createFromDto: (experienceDto: ExperienceDto) => {
    return ExperienceRepository.create({
      company: experienceDto.company,
      description: experienceDto.description,
      endDate: stringToDate(experienceDto.endDate),
      rol: experienceDto.rol,
      startDate: stringToDate(experienceDto.startDate),
    });
  },

  createOrEditFromDto(experienceDto: ExperienceDto, resume: Resume) {
    if (experienceDto.id) {
      return ExperienceRepository.createQueryBuilder()
        .update()
        .set({
          ...omit(experienceDto, ['id']),
          startDate: stringToDate(experienceDto.startDate),
          endDate: experienceDto.endDate ? stringToDate(experienceDto.endDate) : null,
          resume,
        })
        .where('id = :id', { id: experienceDto.id })
        .execute();
    }

    return ExperienceRepository.createQueryBuilder()
      .insert()
      .values([
        {
          ...experienceDto,
          startDate: stringToDate(experienceDto.startDate),
          endDate: experienceDto.endDate ? stringToDate(experienceDto.endDate) : null,
          resume,
        },
      ])
      .execute();
  },

  getByResume(resume: Resume) {
    return ExperienceRepository.createQueryBuilder('ex')
      .select(['ex.id', 'ex.rol', 'ex.company', 'ex.startDate', 'ex.endDate', 'ex.keepWorking', 'ex.description'])
      .where('ex.resume_id = :id', { id: resume.id })
      .getMany();
  },
});
