import { AppDataSource } from '@/data-source';
import { CreateAboutMeDto, ResumeDto } from '@/dtos/resume.dto';
import { Applicant } from '@/models/applicant.model';
import { Resume } from '@/models/resume.model';
import { HttpError } from 'routing-controllers';

const resumeRepository = AppDataSource.getRepository(Resume);

const createDetail = () =>
  ResumeRepository.createQueryBuilder('rs')
    .select(['rs.id', 'rs.title', 'rs.aboutMe', 'rs.modificationDate'])
    .addSelect(['ex.id', 'ex.rol', 'ex.company', 'ex.startDate', 'ex.endDate', 'ex.keepWorking', 'ex.description'])
    .addSelect(['ed.id', 'ed.institute', 'ed.title', 'ed.startDate', 'ed.endDate', 'ed.keepStudy'])
    .addSelect(['pr.id', 'pr.name', 'pr.phoneNumber', 'pr.relationship'])
    .addSelect(['lr.id', 'lr.name', 'lr.phoneNumber', 'lr.rol'])
    .addSelect(['rlan.id', 'rlan.languageLevel'])
    .addSelect('lang.name')
    .addSelect(['sk.id', 'sk.name'])
    .leftJoin('rs.experiences', 'ex')
    .leftJoin('rs.educations', 'ed')
    .leftJoin('rs.personal_references', 'pr')
    .leftJoin('rs.laboral_references', 'lr')
    .leftJoin('rs.resumeLanguage', 'rlan')
    .leftJoin('rlan.language', 'lang')
    .leftJoin('rs.skills', 'sk');

export const ResumeRepository = resumeRepository.extend({
  createFromDto: (dto: ResumeDto): Resume => {
    return ResumeRepository.create({
      aboutMe: dto.aboutMe,
    });
  },
  updateAboutme: async (dto: CreateAboutMeDto, applicant: Applicant) => {
    try {
      await ResumeRepository.createQueryBuilder()
        .update()
        .set({
          aboutMe: dto.aboutMe,
        })
        .where('id = :id', { id: dto.resumeId })
        .andWhere('applicant_id = :applicantId', { applicantId: applicant.id })
        .execute();

      return await ResumeRepository.createQueryBuilder('rs').select(['rs.about_me']).where('rs.id = :id', { id: dto.resumeId }).getOneOrFail();
    } catch (e) {
      console.error(e);
      throw new HttpError(500, 'hubo un error');
    }
  },
  getBasicInfoById(id: number, applicant: Applicant) {
    return ResumeRepository.createQueryBuilder('rs')
      .select(['rs.id', 'rs.title', 'rs.aboutMe', 'rs.modificationDate'])
      .where('rs.id = :id', { id })
      .andWhere('rs.applicant_id = :applicantId', { applicantId: applicant.id })
      .getOneOrFail();
  },
  /**
   *
   * @param id resume id.
   * @param applicant
   */
  async getFullById(id: number, applicant: Applicant) {
    return ResumeRepository.createQueryBuilder('rs')
      .select(['rs.id', 'rs.title', 'rs.aboutMe', 'rs.modificationDate'])
      .addSelect(['ex.id', 'ex.rol', 'ex.company', 'ex.startDate', 'ex.endDate', 'ex.keepWorking', 'ex.description'])
      .addSelect(['ed.id', 'ed.institute', 'ed.title', 'ed.startDate', 'ed.endDate', 'ed.keepStudy'])
      .addSelect(['pr.id', 'pr.name', 'pr.phoneNumber', 'pr.relationship'])
      .addSelect(['lr.id', 'lr.name', 'lr.phoneNumber', 'lr.rol'])
      .addSelect(['rlan.id', 'rlan.languageLevel'])
      .addSelect('lang.name')
      .addSelect(['sk.id', 'sk.name'])
      .leftJoin('rs.experiences', 'ex')
      .leftJoin('rs.educations', 'ed')
      .leftJoin('rs.personal_references', 'pr')
      .leftJoin('rs.laboral_references', 'lr')
      .leftJoin('rs.resumeLanguage', 'rlan')
      .leftJoin('rlan.language', 'lang')
      .leftJoin('rs.skills', 'sk')
      .where('rs.id = :id', { id })
      .andWhere('rs.applicant_id = :applicantId', { applicantId: applicant.id })
      .getOneOrFail();
  },

  async getFullByIdNoSecure(id: number) {
    return createDetail().where('rs.id = :id', { id }).getOneOrFail();
  },
});
