import { AppDataSource } from '@/data-source';
import { CreateAboutMeDto, ResumeDto } from '@/dtos/resume.dto';
import { Applicant } from '@/models/applicant.model';
import { Resume } from '@/models/resume.model';
import { HttpError } from 'routing-controllers';

const resumeRepository = AppDataSource.getRepository(Resume);

export const ResumeRepository = resumeRepository.extend({
  createFromDto: (dto: ResumeDto): Resume => {
    return ResumeRepository.create({
      about_me: dto.about_me,
    });
  },
  updateAboutme: async (dto: CreateAboutMeDto, applicant: Applicant) => {
    try {
      await ResumeRepository.createQueryBuilder()
        .update()
        .set({
          about_me: dto.about_me,
        })
        .where('id = :id', { id: dto.resume_id })
        .andWhere('applicantId = :applicantId', { applicantId: applicant.id })
        .execute();

      return await ResumeRepository.createQueryBuilder('rs').select(['rs.about_me']).where('rs.id = :id', { id: dto.resume_id }).getOneOrFail();
    } catch (e) {
      console.error(e);
      throw new HttpError(500, 'hubo un error');
    }
  },
  getBasicInfoById(id: number, applicant: Applicant) {
    return ResumeRepository.createQueryBuilder('rs')
      .select(['rs.id', 'rs.title', 'rs.about_me', 'rs.modification_date'])
      .where('rs.id = :id', { id })
      .andWhere('rs.applicantId = :applicantId', { applicantId: applicant.id })
      .getOneOrFail();
  },
  /**
   *
   * @param id resume id.
   * @param applicant
   */
  async getFullById(id: number, applicant: Applicant) {
    return ResumeRepository.createQueryBuilder('rs')
      .select(['rs.id', 'rs.title', 'rs.about_me', 'rs.modification_date'])
      .addSelect(['ex.id', 'ex.rol', 'ex.company', 'ex.start_date', 'ex.end_date', 'ex.keep_working', 'ex.description'])
      .addSelect(['ed.id', 'ed.institute', 'ed.title', 'ed.start_date', 'ed.end_date', 'ed.keep_study'])
      .addSelect(['pr.id', 'pr.name', 'pr.number', 'pr.relationship'])
      .addSelect(['lr.id', 'lr.name', 'lr.number', 'lr.rol'])
      .addSelect(['rlan.id', 'rlan.language_level'])
      .addSelect('lang.name')
      .addSelect(['sk.id', 'sk.name'])
      .leftJoin('rs.experiences', 'ex')
      .leftJoin('rs.educations', 'ed')
      .leftJoin('rs.personal_references', 'pr')
      .leftJoin('rs.laboral_references', 'lr')
      .leftJoin('rs.resumeToLanguage', 'rlan')
      .leftJoin('rlan.language', 'lang')
      .leftJoin('rs.skills', 'sk')
      .where('rs.id = :id', { id })
      .andWhere('rs.applicantId = :applicantId', { applicantId: applicant.id })
      .getOneOrFail();
  },
});
