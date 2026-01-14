import { Repository, SelectQueryBuilder } from 'typeorm';
import { Resume } from '../entities/resume.entity';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  CriteriaBuilder,
  CriteriaCombiner,
} from 'src/shared/criteria/criteria';

export class ResumeFactory {
  constructor(private readonly resumeRepository: Repository<Resume>) {}

  private setDetailSelection(queryBuilder: SelectQueryBuilder<Resume>) {
    queryBuilder
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
      .addSelect(['lang.id', 'lang.name'])
      // skills
      .addSelect(['sk.id', 'sk.name'])
      // applicant
      .addSelect(['app.id'])
      .leftJoin('rs.experiences', 'ex')
      .leftJoin('rs.educations', 'ed')
      .leftJoin('rs.personal_references', 'pr')
      .leftJoin('rs.laboral_references', 'lr')
      .leftJoin('rs.resumeLanguage', 'rlan')
      .leftJoin('rlan.language', 'lang')
      .leftJoin('rs.skills', 'sk')
      .leftJoin('rs.applicant', 'app');
  }

  getResumeDetailsQuery(resumeId: number, token: TokenDto) {
    const queryBuilder = this.resumeRepository.createQueryBuilder('rs');

    this.setDetailSelection(queryBuilder);

    let criteria = CriteriaCombiner.create(
      CriteriaBuilder.equals<Resume>('rs.id', resumeId),
    );

    criteria = criteria.and(CriteriaBuilder.equals<Resume>('app.id', token.id));

    criteria.apply(queryBuilder);

    return queryBuilder;
  }

  getResumeOverviewQuery(applicantId: number) {
    const queryBuilder = this.resumeRepository
      .createQueryBuilder('rs')
      .select(['rs.id', 'rs.title', 'rs.aboutMe'])
      .addSelect(['app.id'])
      .leftJoin('rs.applicant', 'app');

    CriteriaBuilder.equals<Resume>('app.id', applicantId).apply(queryBuilder);

    queryBuilder.orderBy('rs.modificationDate', 'DESC');

    return queryBuilder;
  }

  getResumeByIdInsecure(resumeId: number) {
    const queryBuilder = this.resumeRepository.createQueryBuilder('rs');
    this.setDetailSelection(queryBuilder);
    CriteriaBuilder.equals<Resume>('rs.id', resumeId).apply(queryBuilder);

    return queryBuilder;
  }
}
