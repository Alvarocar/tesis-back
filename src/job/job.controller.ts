import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { JobService } from './job.service';
import { JobFilterDto } from './dto/job-filter.dto';
import { Public, Roles } from 'src/shared/constants/metadata.constant';
import { ParseIntPipe } from 'src/shared/pipes/parse-int-id.pipe';
import type { RequestWithUser } from 'src/shared/types/request-with-user';
import { Role } from 'src/shared/enums/role.enum';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { ParsingUtil } from 'src/shared/utils/parsing.util';

@Controller('v1/job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @Public()
  async findAll(@Query() filter: JobFilterDto, @CurrentUser() user?: TokenDto) {
    const { page = 1, pageSize = 10 } = filter;
    const [result, count] = await this.jobService.findAll(filter, user);
    return ParsingUtil.paginate(result, count, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobService.findOne(id);
  }

  @Get('applied/:id')
  @Roles(Role.Applicant)
  findOneApplied(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: RequestWithUser,
  ) {
    return this.jobService.isApplied(request.user, id);
  }
}
