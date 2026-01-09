import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { JobService } from './job.service';
import { JobFilterDto } from './dto/job-filter.dto';
import { Public, Roles } from 'src/shared/constants/metadata.constant';
import { ParseIntPipe } from 'src/shared/pipes/parse-int-id.pipe';
import type {
  RequestWithOptionalUser,
  RequestWithUser,
} from 'src/shared/types/request-with-user';
import { Role } from 'src/shared/enums/role.enum';

@Controller('v1/job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @Public()
  async findAll(
    @Query() filter: JobFilterDto,
    @Req() request: RequestWithOptionalUser,
  ) {
    const [result, count] = await this.jobService.findAll(filter, request.user);
    const skip = (filter.page - 1) * filter.pageSize;
    const take = filter.pageSize;

    return {
      result,
      totalPages: take ? Math.ceil(count / take) : count,
      currentPage: skip && take ? skip / take + 1 : 1,
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobService.findOne(id);
  }

  @Get('applied/:id')
  @Roles(Role.Employee)
  findOneApplied(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: RequestWithUser,
  ) {
    return this.jobService.isApplied(request.user, id);
  }
}
