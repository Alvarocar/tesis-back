import { AppDataSource } from '@/data-source';
import { EducationDto } from '@/dtos/resume.dto';
import { Education } from '@/models/education.model';
import { stringToDate } from '@/utils/date.util';

export const EducationRepository = AppDataSource.getRepository(Education).extend({
  createFromDto(educationDto: EducationDto) {
    return EducationRepository.create({
      institute: educationDto.institute,
      tittle: educationDto.title,
      end_date: stringToDate(educationDto.end_date),
      start_date: stringToDate(educationDto.start_date),
    });
  },
});
