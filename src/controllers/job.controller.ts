import { Controller, Get, Param, QueryParam, Req, UseBefore } from 'routing-controllers';
import authApplicantMiddleware from '@/middlewares/authApplicant.middleware';
import { RequestWithApplicant } from '@/interfaces/auth.interface';
import { VacantRepository } from '@/repositories/vacant.repository';
import { JobService } from '@/services/job.service';
import { ENV } from '@/constants';
import { Like } from 'typeorm';

@Controller('/v1/job')
export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  @Get('/')
  async getJobs(@QueryParam('page') page = 1, @QueryParam('pageSize') pageSize = 10, @QueryParam('q') query: string) {
    return this.jobService.getJobs(page, pageSize, query);
  }

  @Get('/:id')
  async getJobDetail(@Param('id') id: number) {
    return VacantRepository.getDetailById(id).then(vacant => ({ ...vacant, company: ENV.COMPANY.NAME }));
  }

  @Get('/applied/:id')
  @UseBefore(authApplicantMiddleware)
  async isApplied(@Req() req: RequestWithApplicant, @Param('id') id: number) {
    return this.jobService.isApplied(req.user, id);
  }
}
