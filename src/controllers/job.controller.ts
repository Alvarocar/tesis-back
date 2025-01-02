import { ENV } from '@/constants';
import { VacantRepository } from '@/repositories/vacant.model';
import { Controller, Get, Param, QueryParam } from 'routing-controllers';

@Controller('/v1/job')
export class JobController {
  @Get('/')
  async getJobs(@QueryParam('page') page = 1, @QueryParam('pageSize') pageSize = 10) {
    const size = pageSize < 0 ? 10 : pageSize > 20 ? 20 : pageSize;
    const pageNumber = page <= 0 ? 1 : page;
    const [jobs, total] = await VacantRepository.findAndCount({
      select: ['id', 'title', 'salaryOffer', 'jobType'],
      skip: (pageNumber - 1) * size,
      take: size,
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
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
    };
  }

  @Get('/:id')
  async getJobDetail(@Param('id') id: number) {
    return VacantRepository.getDetailById(id).then(vacant => ({ ...vacant, company: ENV.COMPANY.NAME }));
  }
}
