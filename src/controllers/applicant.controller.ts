import { ApplicantDto, ApplicantDtoLogIn, ApplicantDtoSignUp } from '@/dtos/applicant.dto';
import { RequestWithApplicant } from '@/interfaces/auth.interface';
import authApplicantMiddleware from '@/middlewares/authApplicant.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { ApplicantService } from '@/services/applicant.service';
import { responseWithToken } from '@/utils/response.util';
import { createTokenRest } from '@/utils/security/token.util';
import { Body, Controller, Get, HttpCode, Post, Put, Req, UseBefore } from 'routing-controllers';

@Controller('/v1/applicants')
export class ApplicantController {
  private applicantService = new ApplicantService();

  @Post('/sign-up')
  @UseBefore(validationMiddleware(ApplicantDtoSignUp, 'body'))
  @HttpCode(201)
  async signUp(@Body() applicant: ApplicantDtoSignUp) {
    const result = await this.applicantService.signUp(applicant);
    const newApplicant = new ApplicantDto({ ...result });
    const token = createTokenRest(newApplicant);
    return responseWithToken(newApplicant, token);
  }

  @Put('/sign-in')
  @HttpCode(200)
  @UseBefore(validationMiddleware(ApplicantDtoLogIn, 'body'))
  async logIn(@Body() applicant: ApplicantDtoLogIn) {
    const currentApplcant = await this.applicantService.logIn(applicant);
    const token = createTokenRest(currentApplcant);
    return responseWithToken(currentApplcant, token);
  }

  @Get()
  @UseBefore(authApplicantMiddleware)
  @HttpCode(200)
  async getProfile(@Req() req: RequestWithApplicant) {
    return this.applicantService.getProfile(req.user);
  }
}
