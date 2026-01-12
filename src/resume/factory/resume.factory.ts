import { Repository } from 'typeorm';
import { Resume } from '../entities/resume.entity';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  CriteriaBuilder,
  CriteriaCombiner,
} from 'src/shared/criteria/criteria';

export class ResumeFactory {
  constructor(private readonly resumeRepository: Repository<Resume>) {}

  getResumeDetailsQuery(resumeId: number, token: TokenDto) {
    const queryBuilder = this.resumeRepository
      .createQueryBuilder('rs')
      .select(['rs.id', 'rs.title', 'rs.aboutMe', 'rs.modificationDate'])
      // experiences
      .addSelect([
        'ex.id',
        'ex.rol',
        'ex.company',
        'ex.startDate',
        'ex.endDate',
        'ex.keepWorking',
        'ex.description',
      ])
      // educations
      .addSelect([
        'ed.id',
        'ed.institute',
        'ed.title',
        'ed.startDate',
        'ed.endDate',
        'ed.keepStudy',
      ])
      // references
      .addSelect(['pr.id', 'pr.name', 'pr.phoneNumber', 'pr.relationship'])
      // laboral references
      .addSelect(['lr.id', 'lr.name', 'lr.phoneNumber', 'lr.rol'])
      // languages
      .addSelect(['rlan.id', 'rlan.languageLevel'])
      .addSelect('lang.name')
      // skills
      .addSelect(['sk.id', 'sk.name'])
      .leftJoin('rs.experiences', 'ex')
      .leftJoin('rs.educations', 'ed')
      .leftJoin('rs.personal_references', 'pr')
      .leftJoin('rs.laboral_references', 'lr')
      .leftJoin('rs.resumeLanguage', 'rlan')
      .leftJoin('rlan.language', 'lang')
      .leftJoin('rs.skills', 'sk');

    let criteria = CriteriaCombiner.create(
      CriteriaBuilder.equals<Resume>('rs.id', resumeId),
    );

    criteria = criteria.and(
      CriteriaBuilder.equals<Resume>('rs.applicantId', token.id),
    );

    criteria.apply(queryBuilder);

    return queryBuilder;
  }

  getResumeOverviewQuery(applicantId: number) {
    const queryBuilder = this.resumeRepository
      .createQueryBuilder('rs')
      .select(['rs.id', 'rs.title', 'rs.aboutMe']);

    CriteriaBuilder.equals<Resume>('rs.applicant_id', applicantId).apply(
      queryBuilder,
    );

    queryBuilder.orderBy('rs.modificationDate', 'DESC');

    return queryBuilder;
  }
}
