import { Controller, Get, Body, Patch, Req, HttpCode } from '@nestjs/common';
import type { RequestWithUser } from 'src/shared/types/request-with-user';
import { Roles } from 'src/shared/constants/metadata.constant';
import { Role } from 'src/shared/enums/role.enum';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantService } from './applicant.service';

@Controller('v1/applicants')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  @Get()
  @Roles(Role.Applicant)
  @HttpCode(200)
  findOne(@Req() request: RequestWithUser) {
    return this.applicantService.findOne(request.user.id);
  }

  @Patch('/personal-info')
  @Roles(Role.Applicant)
  @HttpCode(200)
  async updatePersonalInfo(
    @Body() updateApplicantDto: UpdateApplicantDto,
    @Req() request: RequestWithUser,
  ) {
    return this.applicantService.update(request.user, updateApplicantDto);
  }
}
