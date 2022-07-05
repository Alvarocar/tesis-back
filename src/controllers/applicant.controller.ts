import { ApplicantDto, ApplicantDtoSignUp } from '@/dtos/applicant.dto';
import { EApplicant } from '@/enums/applicant.enum';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { ApplicantService } from '@/services/applicant.service';
import { responseWithData } from '@/utils/response.util';
import { Body, Controller, HttpCode, Post, UseBefore } from 'routing-controllers';

@Controller('/v1/applicants')
export class ApplicantController {
  private applicantService = new ApplicantService();

  @Post('/signup')
  @UseBefore(validationMiddleware(ApplicantDtoSignUp, 'body'))
  @HttpCode(201)
  async signUp(@Body() applicant: ApplicantDtoSignUp) {
    const result = await this.applicantService.signUp(applicant);
    const newApplicant = new ApplicantDto({ ...result });
    return responseWithData(newApplicant, { message: EApplicant.SIGN_UP });
  }
}
