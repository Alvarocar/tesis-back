import { omit } from 'lodash';
import { AppDataSource } from '@/data-source';
import { EducationDto } from '@/dtos/resume.dto';
import { Education } from '@/models/education.model';
import { stringToDate } from '@/utils/date.util';
import { Resume } from '@/models/resume.model';

export const EducationRepository = AppDataSource.getRepository(Education).extend({
  createFromDto(educationDto: EducationDto) {
    return EducationRepository.create({
      institute: educationDto.institute,
      title: educationDto.title,
      end_date: educationDto.end_date ? stringToDate(educationDto.end_date) : null,
      start_date: stringToDate(educationDto.start_date),
      keep_study: educationDto.keep_study,
    });
  },
  createOrEditFromDto(educationDto: EducationDto, resume: Resume) {
    if (educationDto.id) {
      return EducationRepository.createQueryBuilder()
        .update()
        .set({
          ...omit(educationDto, ['id']),
          start_date: stringToDate(educationDto.start_date),
          end_date: educationDto.end_date ? stringToDate(educationDto.end_date) : null,
          resume,
        })
        .where('id = :id', { id: educationDto.id })
        .execute();
    }

    return EducationRepository.createQueryBuilder()
      .insert()
      .values([
        {
          ...educationDto,
          start_date: stringToDate(educationDto.start_date),
          end_date: educationDto.end_date ? stringToDate(educationDto.end_date) : null,
          resume,
        },
      ])
      .execute();
  },

  getByResume(resume: Resume) {
    return EducationRepository.createQueryBuilder('ed')
      .select(['ed.id', 'ed.institute', 'ed.title', 'ed.start_date', 'ed.end_date', 'ed.keep_study'])
      .where('ed.resumeId = :id', { id: resume.id })
      .getMany();
  },
});
