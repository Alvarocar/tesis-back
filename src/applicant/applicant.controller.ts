import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, HttpCode } from '@nestjs/common';
import type { RequestWithUser } from 'src/shared/types/request-with-user';
import { CreateApplicantDto } from 'src/auth/dto/create-applicant.dto';
import { TokenGuard } from 'src/shared/security/guards/token.guard';
import { Roles } from 'src/shared/constants/metadata.constant';
import { Role } from 'src/shared/enums/role.enum';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantService } from './applicant.service';
import { ParseIntIdPipe } from 'src/shared/pipes/parse-int-id.pipe';

@Controller('v1/applicants')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  @Post('/sign-up')
  create(@Body() createApplicantDto: CreateApplicantDto) {
    return this.applicantService.create(createApplicantDto);
  }

  @Get()
  @Roles(Role.Employee)
  @UseGuards(TokenGuard)
  @HttpCode(200)
  findOne(@Req() request: RequestWithUser) {
    return this.applicantService.findOne(request.user.id);
  }

  @Patch('/personal-info')
  @Roles(Role.Employee)
  @UseGuards(TokenGuard)
  @HttpCode(200)
  async updatePersonalInfo(@Body() updateApplicantDto: UpdateApplicantDto, @Req() request: RequestWithUser) {
    return this.applicantService.update(request.user, updateApplicantDto);
  }
}
