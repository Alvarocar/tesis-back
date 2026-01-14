import { Repository } from 'typeorm';
import { JobFilterDto } from '../dto/job-filter.dto';
import { Vacancy } from 'src/vacancy/entities/vacancy.entity';
import {
  CriteriaBuilder,
  CriteriaCombiner,
} from 'src/shared/criteria/criteria';

export class JobSearchFactory {
  constructor(private readonly repository: Repository<Vacancy>) {}

  buildSearchJobsQuery(dto: JobFilterDto) {
    const { q } = dto;
    const queryBuilder = this.repository
      .createQueryBuilder('vacancy')
      .select([
        'vacancy.id',
        'vacancy.title',
        'vacancy.description',
        'vacancy.experienceYears',
        'vacancy.salaryOffer',
        'vacancy.jobType',
        'vacancy.creationDate',
        'vacancy.modificationDate',
      ])
      .leftJoin('vacancy.employee', 'employee')
      .leftJoin('employee.company', 'company')
      .addSelect(['employee.id'])
      .addSelect(['company.id', 'company.name']);

    // Start with pagination criteria
    let criteriaBuilder = CriteriaCombiner.create(
      CriteriaBuilder.pagination<Vacancy>({
        page: dto.page ?? 1,
        pageSize: dto.pageSize ?? 10,
      }),
    );

    // Add optional search in title and description (case insensitive)
    if (q && q.trim()) {
      const titleSearchCriteria = CriteriaBuilder.ilike<Vacancy>(
        'vacancy.title',
        q.trim(),
      );
      const descriptionSearchCriteria = CriteriaBuilder.ilike<Vacancy>(
        'vacancy.description',
        q.trim(),
      );

      const searchCombiner = CriteriaCombiner.create(titleSearchCriteria).or(
        descriptionSearchCriteria,
      );

      criteriaBuilder = criteriaBuilder.and(searchCombiner);
    }

    // Apply all criteria to the query builder
    criteriaBuilder.apply(queryBuilder);

    queryBuilder.orderBy('vacancy.modificationDate', 'DESC');

    return queryBuilder;
  }

  buildByIdQuery(id: number) {
    return this.repository
      .createQueryBuilder('vr')
      .select([
        'vr.id',
        'vr.title',
        'vr.description',
        'vr.experienceYears',
        'vr.modificationDate',
        'vr.salaryOffer',
        'vr.jobType',
      ])
      .where('vr.id = :id', { id });
  }
}
