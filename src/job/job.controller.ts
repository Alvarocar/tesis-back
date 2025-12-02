import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobFilterDto } from './dto/job-filter.dto';
import { SecurityGuard } from 'src/shared/security/security.guard';
import { Public } from 'src/shared/constants/metadata.constant';
import { ParseIntIdPipe } from 'src/shared/pipes/parse-int-id.pipe';
import type { RequestWithOptionalUser, RequestWithUser } from 'src/shared/types/request-with-user';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @UseGuards(SecurityGuard)
  @Public()
  async findAll(
    @Query() filter: JobFilterDto,
    @Req() request: RequestWithOptionalUser
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
  findOne(@Param('id', ParseIntIdPipe) id: number) {
    return this.jobService.findOne(id);
  }

  @Get('applied/:id')
  @UseGuards(SecurityGuard)
  findOneApplied(
    @Param('id', ParseIntIdPipe) id: number,
    @Req() request: RequestWithUser,
  ) {
    return this.jobService.isApplied(request.user, id);
  }
}
