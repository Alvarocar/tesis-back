import { Body, Controller, HttpCode, Post, Put, UseBefore } from 'routing-controllers';
import { authPasswordMiddleware } from '@/middlewares/authPassword.middleware';
import { RecruiterDtoLogIn, RecruiterDtoSignUp } from '@/dtos/recluter.dto';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { RecruiterService } from '@/services/recluter.service';
import { createTokenRest } from '@/utils/security/token.util';
import { responseWithToken } from '@/utils/response.util';

@Controller('/v1/recruiter')
export class RecruiterController {
  private recruiterService = new RecruiterService();

  @Post('/sign-up')
  @UseBefore(authPasswordMiddleware)
  @UseBefore(validationMiddleware(RecruiterDtoSignUp, 'body'))
  @HttpCode(201)
  async signUp(@Body() recruiter: RecruiterDtoSignUp) {
    const resp = await this.recruiterService.signUp(recruiter);
    return { message: `Reclutador: ${resp.email} creado!` };
  }

  @Put('/sign-in')
  @HttpCode(204)
  @UseBefore(validationMiddleware(RecruiterDtoLogIn, 'body'))
  async logIn(@Body() recruiter: RecruiterDtoLogIn) {
    const resRecruiter = await this.recruiterService.logIn(recruiter);
    const token = createTokenRest(resRecruiter, { userType: 'recruiter' });
    return responseWithToken(resRecruiter, token);
  }
}
