import { FindOptionsSelect, FindOptionsWhere, ILike } from 'typeorm';
import { VacantRepository } from '@/repositories/vacant.repository';
import { Vacant } from '@/models/vacant.model';
import { ENV } from '@/constants';

export class GetJobsBuilder {
  private fields: FindOptionsSelect<Vacant>;
  private where: FindOptionsWhere<Vacant>[];
  private skip?: number;
  private take?: number;

  constructor({ fields }: { fields: FindOptionsSelect<Vacant> }) {
    this.fields = fields;
    this.where = [];
  }

  public static createBuilder({ fields }: { fields: FindOptionsSelect<Vacant> }) {
    return new GetJobsBuilder({ fields });
  }

  addPage(page: number, size = 10) {
    this.skip = (page - 1) * size;
    this.take = size;
    return this;
  }

  addFilter<Key extends keyof FindOptionsWhere<Vacant>>(key: Key, value: FindOptionsWhere<Vacant>[Key]) {
    this.where = [
      ...this.where,
      {
        [key]: value,
      },
    ];
    return this;
  }

  addSearch(query: string) {
    this.where = [
      ...this.where,
      {
        title: ILike(`%${query}%`),
      },
      {
        description: ILike(`%${query}%`),
      },
    ];
    return this;
  }

  async build() {
    const [jobs, total] = await VacantRepository.findAndCount({
      select: this.fields,
      skip: this.skip,
      take: this.take,
      where: this.where,
      order: {
        id: 'DESC',
      },
    });

    return {
      result: jobs.map(job => ({
        company: ENV.COMPANY.NAME,
        id: job.id,
        title: job.title,
        salary: job.salaryOffer,
        type: job.jobType,
        salaryOffer: job.salaryOffer,
        jobType: job.jobType,
      })),
      totalPages: this.take ? Math.ceil(total / this.take) : total,
      currentPage: this.skip && this.take ? this.skip / this.take + 1 : 1,
    };
  }
}
