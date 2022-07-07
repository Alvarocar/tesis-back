import { ApplicantDto, ApplicantDtoSignUp } from '@/dtos/applicant.dto';
import { EApplicant } from '@/enums/applicant.enum';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { ApplicantService } from '@/services/applicant.service';
import { responseWithData } from '@/utils/response.util';
import { createTokenRest } from '@/utils/security/token.util';
import { Response } from 'express';
import { Body, Controller, HttpCode, Post, Res, UseBefore } from 'routing-controllers';

@Controller('/v1/applicants')
export class ApplicantController {
  private applicantService = new ApplicantService();

  @Post('/signup')
  @UseBefore(validationMiddleware(ApplicantDtoSignUp, 'body'))
  @HttpCode(201)
  async signUp(@Body() applicant: ApplicantDtoSignUp, @Res() res: Response) {
    const result = await this.applicantService.signUp(applicant);
    const newApplicant = new ApplicantDto({ ...result });
    res.setHeader('Authorization', createTokenRest(newApplicant, {}));
    return responseWithData(newApplicant, { message: EApplicant.SIGN_UP });
  }
}
