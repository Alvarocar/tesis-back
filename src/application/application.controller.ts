import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  Query,
  Req,
} from '@nestjs/common';
import { Role } from 'src/shared/enums/role.enum';
import { Roles } from 'src/shared/constants/metadata.constant';
import type { RequestWithUser } from 'src/shared/types/request-with-user';
import { ApplicationFilterDto } from './dto/application-filter.dto';
import { ApplicationService } from './application.service';
import { ParseIntPipe } from 'src/shared/pipes/parse-int-id.pipe';

@Controller('v1/application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('/apply/:vacantId/:resumeId')
  @Roles(Role.Applicant)
  @HttpCode(202)
  async apply(
    @Req() request: RequestWithUser,
    @Param('vacantId') vacancyId: number,
    @Param('resumeId') resumeId: number,
  ) {
    await this.applicationService.apply(request.user, vacancyId, resumeId);
    return { applied: true };
  }

  @Get('/is-done/:vacantId/:resumeId')
  @Roles(Role.Applicant)
  @HttpCode(200)
  async isDone(
    @Param('vacantId', ParseIntPipe) vacantId: number,
    @Param('resumeId', ParseIntPipe) resumeId: number,
    @Req() req: RequestWithUser,
  ) {
    const { application } = await this.applicationService.wasApplicationDone(
      vacantId,
      resumeId,
      req.user,
    );
    return { isDone: Boolean(application) };
  }

  @Get('/procceses/:vacantId')
  @Roles(Role.Employee, Role.Admin)
  @HttpCode(200)
  async getApplicationsByVacant(
    @Param('vacantId') vacantId: number,
    @Query() filters: ApplicationFilterDto,
  ) {
    return this.applicationService.getApplicationsByVacant(filters, vacantId);
  }

  @Get('/:applicationId')
  @Roles(Role.Employee, Role.Admin)
  @HttpCode(200)
  async getApplicationDetail(@Param('applicationId') applicationId: number) {
    return this.applicationService.getApplicationDetail(applicationId);
  }
}
