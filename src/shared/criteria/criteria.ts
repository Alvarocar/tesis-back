import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

export abstract class CriteriaBase<Entity extends ObjectLiteral> {
  abstract apply(queryBuilder: SelectQueryBuilder<Entity>): void;
}

// Enum for logical operators
export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

// Enum for comparison operators
export enum ComparisonOperator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  LIKE = 'LIKE',
  ILIKE = 'ILIKE',
  IN = 'IN',
  NOT_IN = 'NOT IN',
  IS_NULL = 'IS NULL',
  IS_NOT_NULL = 'IS NOT NULL',
  BETWEEN = 'BETWEEN',
}

// Simple field criteria
export class FieldCriteria<
  Entity extends ObjectLiteral,
> extends CriteriaBase<Entity> {
  constructor(
    private field: string,
    private operator: ComparisonOperator,
    private value?: any,
    private secondValue?: any, // For BETWEEN operator
  ) {
    super();
  }

  apply(queryBuilder: SelectQueryBuilder<Entity>): void {
    const paramName = this.generateParamName();

    switch (this.operator) {
      case ComparisonOperator.EQUALS:
      case ComparisonOperator.NOT_EQUALS:
      case ComparisonOperator.GREATER_THAN:
      case ComparisonOperator.GREATER_THAN_OR_EQUAL:
      case ComparisonOperator.LESS_THAN:
      case ComparisonOperator.LESS_THAN_OR_EQUAL:
        queryBuilder.andWhere(`${this.field} ${this.operator} :${paramName}`, {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          [paramName]: this.value,
        });
        break;
      case ComparisonOperator.LIKE:
      case ComparisonOperator.ILIKE:
        queryBuilder.andWhere(`${this.field} ${this.operator} :${paramName}`, {
          [paramName]: `%${this.value}%`,
        });
        break;
      case ComparisonOperator.IN:
      case ComparisonOperator.NOT_IN:
        if (Array.isArray(this.value) && this.value.length > 0) {
          queryBuilder.andWhere(
            `${this.field} ${this.operator} (:...${paramName})`,
            { [paramName]: this.value },
          );
        }
        break;
      case ComparisonOperator.IS_NULL:
        queryBuilder.andWhere(`${this.field} IS NULL`);
        break;
      case ComparisonOperator.IS_NOT_NULL:
        queryBuilder.andWhere(`${this.field} IS NOT NULL`);
        break;
      case ComparisonOperator.BETWEEN:
        if (this.value !== undefined && this.secondValue !== undefined) {
          const paramName2 = `${paramName}_end`;
          queryBuilder.andWhere(
            `${this.field} BETWEEN :${paramName} AND :${paramName2}`,
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              [paramName]: this.value,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              [paramName2]: this.secondValue,
            },
          );
        }
        break;
    }
  }

  private generateParamName(): string {
    return (
      this.field.replace(/\./g, '_') +
      '_' +
      Math.random().toString(36).substr(2, 9)
    );
  }
}

// Raw SQL criteria for complex conditions
export class RawCriteria<
  Entity extends ObjectLiteral,
> extends CriteriaBase<Entity> {
  constructor(
    private condition: string,
    private parameters: Record<string, any> = {},
  ) {
    super();
  }

  apply(queryBuilder: SelectQueryBuilder<Entity>): void {
    queryBuilder.andWhere(this.condition, this.parameters);
  }
}

// Pagination criteria for limit and offset
export class PaginationCriteria<
  Entity extends ObjectLiteral,
> extends CriteriaBase<Entity> {
  constructor(private pagination: PaginationDto) {
    super();
  }

  apply(queryBuilder: SelectQueryBuilder<Entity>): void {
    queryBuilder
      .skip(this.pagination.pageSize * (this.pagination.page - 1))
      .take(this.pagination.pageSize);
  }
}

// Criteria combiner class
export class CriteriaCombiner<
  Entity extends ObjectLiteral,
> extends CriteriaBase<Entity> {
  private criteriaList: Array<{
    criteria: CriteriaBase<Entity>;
    operator: LogicalOperator;
  }> = [];

  constructor(initialCriteria?: CriteriaBase<Entity>) {
    super();
    if (initialCriteria) {
      this.criteriaList.push({
        criteria: initialCriteria,
        operator: LogicalOperator.AND,
      });
    }
  }

  and(criteria: CriteriaBase<Entity>): CriteriaCombiner<Entity> {
    this.criteriaList.push({ criteria, operator: LogicalOperator.AND });
    return this;
  }

  or(criteria: CriteriaBase<Entity>): CriteriaCombiner<Entity> {
    this.criteriaList.push({ criteria, operator: LogicalOperator.OR });
    return this;
  }

  apply(queryBuilder: SelectQueryBuilder<Entity>): void {
    if (this.criteriaList.length === 0) return;

    // Apply first criteria without operator
    const firstCriteria = this.criteriaList[0];
    firstCriteria.criteria.apply(queryBuilder);

    // Apply remaining criteria with their operators
    for (let i = 1; i < this.criteriaList.length; i++) {
      const { criteria, operator } = this.criteriaList[i];

      if (operator === LogicalOperator.OR) {
        // For OR operations, create a clone to collect the where conditions
        const tempQuery = queryBuilder.clone();
        // Clear existing where conditions in the temp query
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (tempQuery as any).expressionMap.wheres = [];

        criteria.apply(tempQuery);

        // Extract the where condition and parameters from temp query
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const whereCondition = (tempQuery as any).expressionMap.wheres
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
          .map((w: any) => w.condition)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .join(' AND ');

        if (whereCondition) {
          queryBuilder.orWhere(
            `(${whereCondition})`,
            tempQuery.getParameters(),
          );
        }
      } else {
        criteria.apply(queryBuilder);
      }
    }
  }

  static create<T extends ObjectLiteral>(
    criteria?: CriteriaBase<T>,
  ): CriteriaCombiner<T> {
    return new CriteriaCombiner<T>(criteria);
  }
}

// Utility class for common criteria patterns
export class CriteriaBuilder {
  static equals<T extends ObjectLiteral>(
    field: string,
    value: any,
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.EQUALS, value);
  }

  static notEquals<T extends ObjectLiteral>(
    field: string,
    value: any,
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.NOT_EQUALS, value);
  }

  static like<T extends ObjectLiteral>(
    field: string,
    value: string,
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.LIKE, value);
  }

  static ilike<T extends ObjectLiteral>(
    field: string,
    value: string,
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.ILIKE, value);
  }

  static greaterThan<T extends ObjectLiteral>(
    field: string,
    value: number | Date,
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.GREATER_THAN, value);
  }

  static greaterThanOrEqual<T extends ObjectLiteral>(
    field: string,
    value: number | Date,
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(
      field,
      ComparisonOperator.GREATER_THAN_OR_EQUAL,
      value,
    );
  }

  static lessThan<T extends ObjectLiteral>(
    field: string,
    value: number | Date,
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.LESS_THAN, value);
  }

  static lessThanOrEqual<T extends ObjectLiteral>(
    field: string,
    value: number | Date,
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(
      field,
      ComparisonOperator.LESS_THAN_OR_EQUAL,
      value,
    );
  }

  static in<T extends ObjectLiteral>(
    field: string,
    values: any[],
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.IN, values);
  }

  static notIn<T extends ObjectLiteral>(
    field: string,
    values: any[],
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.NOT_IN, values);
  }

  static isNull<T extends ObjectLiteral>(field: string): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.IS_NULL);
  }

  static isNotNull<T extends ObjectLiteral>(field: string): FieldCriteria<T> {
    return new FieldCriteria<T>(field, ComparisonOperator.IS_NOT_NULL);
  }

  static between<T extends ObjectLiteral>(
    field: string,
    startValue: any,
    endValue: any,
  ): FieldCriteria<T> {
    return new FieldCriteria<T>(
      field,
      ComparisonOperator.BETWEEN,
      startValue,
      endValue,
    );
  }

  static raw<T extends ObjectLiteral>(
    condition: string,
    parameters: Record<string, any> = {},
  ): RawCriteria<T> {
    return new RawCriteria<T>(condition, parameters);
  }

  static pagination<T extends ObjectLiteral>(
    pagination: PaginationDto,
  ): CriteriaBase<T> {
    return new PaginationCriteria<T>(pagination);
  }
}
