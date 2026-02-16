import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  CriteriaBuilder,
  CriteriaCombiner,
} from 'src/shared/criteria/criteria';
import { VacancyFilterDto } from '../dto/vacancy-filter.dto';
import { Vacancy } from '../entities/vacancy.entity';
import { TokenDto } from 'src/shared/security/dto/token.dto';

export class VacancySearchFactory {
  constructor(private readonly repository: Repository<Vacancy>) {}

  /**
   * This method builds a query to search vacancies based on the provided filter DTO and user.
   * thats mean it will only return the vacancies created by the user.
   * @param dto
   * @param user
   * @returns
   */
  buildSearchVacancysQuery(
    dto: VacancyFilterDto,
    user: TokenDto,
  ): SelectQueryBuilder<Vacancy> {
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
      .addSelect(['employee.id']);

    // Start with pagination criteria
    let criteriaBuilder = CriteriaCombiner.create(
      CriteriaBuilder.pagination<Vacancy>(dto),
    );

    criteriaBuilder = criteriaBuilder.and(
      CriteriaBuilder.equals<Vacancy>('employee.id', user.id),
    );

    if (dto.statusFilter) {
      criteriaBuilder = criteriaBuilder.and(
        CriteriaBuilder.equals<Vacancy>('vacancy.status', dto.statusFilter),
      );
    }

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
}
