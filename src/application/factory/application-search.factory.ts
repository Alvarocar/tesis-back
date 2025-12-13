import { Repository } from "typeorm";
import { Application } from "../entities/application.entity";
import { ApplicationFilterDto } from "../dto/application-filter.dto";
import { CriteriaBuilder, CriteriaCombiner } from "src/shared/criteria/criteria";

export class ApplicationSearchFactory {

  constructor(
    private readonly repository: Repository<Application>
  ) { }

  private alias = 'app';
  private vacancyAlias = 'vac';
  private resumeAlias = 'res';
  private applicantAlias = 'appli';

  private selectOverviewFields() {
    return [
      `${this.alias}.id`,
      `${this.alias}.status`,
      `${this.alias}.feedBack`,
      `${this.alias}.creationDate`,
      `${this.alias}.affinity`,
      `${this.resumeAlias}.id`,
      `${this.applicantAlias}.id`,
      `${this.applicantAlias}.firstName`,
      `${this.applicantAlias}.lastName`,
    ];
  }

  buildSearchByVacantQuery(vacancyId: number, filter: ApplicationFilterDto) {
    const queryBuilder = this.repository
      .createQueryBuilder(this.alias)
      .select(this.selectOverviewFields())
      .innerJoin(`${this.alias}.vacancy`, this.vacancyAlias)
      .innerJoin(`${this.alias}.resume`, this.resumeAlias)
      .innerJoin(`${this.resumeAlias}.applicant`, this.applicantAlias)

    // Start with pagination criteria
    let criteriaBuilder = CriteriaCombiner.create(
      CriteriaBuilder.pagination<Application>(filter)
    ).and(CriteriaBuilder.equals<Application>(`${this.vacancyAlias}.id`, vacancyId));

    const { q } = filter;

    if (q && q.trim()) {
      const titleSearchCriteria = CriteriaBuilder.ilike<Application>(`${this.alias}.feedBack`, q.trim());
      const firstNameSearchCriteria = CriteriaBuilder.ilike<Application>(`${this.resumeAlias}.firstName`, q.trim());
      const lastNameSearchCriteria = CriteriaBuilder.ilike<Application>(`${this.resumeAlias}.lastName`, q.trim());

      const searchCombiner = CriteriaCombiner
        .create(titleSearchCriteria)
        .or(firstNameSearchCriteria)
        .or(lastNameSearchCriteria);

      criteriaBuilder = criteriaBuilder.and(searchCombiner);
    }

    // Apply all criteria to the query builder
    criteriaBuilder.apply(queryBuilder);

    return queryBuilder;
  }

  static createSearchByVacant(vacancyId: number) {
    return { vacancyId };
  }

}