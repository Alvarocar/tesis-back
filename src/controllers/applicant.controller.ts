import { ApplicantDto, ApplicantDtoLogIn, ApplicantDtoSignUp } from '@/dtos/applicant.dto';
import { EApplicant } from '@/enums/applicant.enum';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { ApplicantService } from '@/services/applicant.service';
import { responseWithData } from '@/utils/response.util';
import { createTokenRest } from '@/utils/security/token.util';
import { Response } from 'express';
import { Body, Controller, HttpCode, Post, Put, Res, UseBefore } from 'routing-controllers';
import { stubObject } from 'lodash';

@Controller('/v1/applicants')
export class ApplicantController {
  private applicantService = new ApplicantService();

  @Post('/sign-up')
  @UseBefore(validationMiddleware(ApplicantDtoSignUp, 'body'))
  @HttpCode(201)
  async signUp(@Body() applicant: ApplicantDtoSignUp, @Res() res: Response) {
    const result = await this.applicantService.signUp(applicant);
    const newApplicant = new ApplicantDto({ ...result });
    res.setHeader('Authorization', createTokenRest(newApplicant, {}));
    return responseWithData(newApplicant, { message: EApplicant.SIGN_UP });
  }

  @Put('/sign-in')
  @HttpCode(204)
  @UseBefore(validationMiddleware(ApplicantDtoLogIn, 'body'))
  async logIn(@Body() applicant: ApplicantDtoLogIn, @Res() res: Response) {
    res.setHeader('Authorization', createTokenRest(await this.applicantService.logIn(applicant), {}));
    return stubObject();
  }
}
