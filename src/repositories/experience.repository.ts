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
      endDate: stringToDate(experienceDto.end_date),
      rol: experienceDto.rol,
      startDate: stringToDate(experienceDto.start_date),
    });
  },

  createOrEditFromDto(experienceDto: ExperienceDto, resume: Resume) {
    if (experienceDto.id) {
      return ExperienceRepository.createQueryBuilder()
        .update()
        .set({
          ...omit(experienceDto, ['id']),
          startDate: stringToDate(experienceDto.start_date),
          endDate: experienceDto.end_date ? stringToDate(experienceDto.end_date) : null,
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
          startDate: stringToDate(experienceDto.start_date),
          endDate: experienceDto.end_date ? stringToDate(experienceDto.end_date) : null,
          resume,
        },
      ])
      .execute();
  },

  getByResume(resume: Resume) {
    return ExperienceRepository.createQueryBuilder('ex')
      .select(['ex.id', 'ex.rol', 'ex.company', 'ex.start_date', 'ex.end_date', 'ex.keep_working', 'ex.description'])
      .where('ex.resumeId = :id', { id: resume.id })
      .getMany();
  },
});
