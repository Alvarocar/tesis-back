import {
  Controller,
  Get,
  Body,
  Patch,
  Req,
  HttpCode,
  Post,
  Delete,
} from '@nestjs/common';
import type { RequestWithUser } from 'src/shared/types/request-with-user';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { Roles } from 'src/shared/constants/metadata.constant';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { Role } from 'src/shared/enums/role.enum';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApplicantService } from './applicant.service';

@Controller('v1/applicants')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  @Delete()
  @Roles(Role.Applicant)
  @HttpCode(204)
  async deleteApplicant(@CurrentUser() user: TokenDto): Promise<void> {
    return this.applicantService.deleteApplicant(user.id);
  }

  @Post('/password-reset')
  @Roles(Role.Applicant)
  @HttpCode(204)
  async sendPasswordResetEmail(@CurrentUser() user: TokenDto): Promise<void> {
    await this.applicantService.generatePasswordResetToken(user.email);
  }

  @Post('/reset-password')
  @HttpCode(204)
  async resetPassword(@Body() body: ResetPasswordDto): Promise<void> {
    await this.applicantService.resetPassword(body.token, body.password);
  }

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
