import { AppDataSource } from '@/data-source';
import { ExperienceDto } from '@/dtos/resume.dto';
import { Experience } from '@/models/experience.model';
import { stringToDate } from '@/utils/date.util';

export const ExperienceRepository = AppDataSource.getRepository(Experience).extend({
  createFromDto: (experienceDto: ExperienceDto) => {
    return ExperienceRepository.create({
      company: experienceDto.company,
      descripcion: experienceDto.description,
      end_date: stringToDate(experienceDto.end_date),
      rol: experienceDto.rol,
      start_date: stringToDate(experienceDto.start_date),
    });
  },
});
