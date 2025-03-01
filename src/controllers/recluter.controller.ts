import { Body, Controller, Get, HttpCode, Post, Put, Req, UseBefore } from 'routing-controllers';
import { authPasswordMiddleware } from '@/middlewares/authPassword.middleware';
import { RecruiterDto, RecruiterDtoLogIn, RecruiterDtoSignUp } from '@/dtos/recluter.dto';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { RecruiterService } from '@/services/recluter.service';
import { createTokenRest } from '@/utils/security/token.util';
import { responseWithToken } from '@/utils/response.util';
import authRecruiterMiddleware from '@/middlewares/authRecluter.middleware';
import { RequestWithRecruiter } from '@/interfaces/auth.interface';

@Controller('/v1/recruiter')
export class RecruiterController {
  private recruiterService = new RecruiterService();

  @Post('/sign-up')
  @UseBefore(validationMiddleware(RecruiterDtoSignUp, 'body'))
  @UseBefore(authPasswordMiddleware)
  @HttpCode(201)
  async signUp(@Body() recruiter: RecruiterDtoSignUp) {
    const resp = await this.recruiterService.signUp(recruiter);
    return { message: `Reclutador: ${resp.email} creado!` };
  }

  @Put('/sign-in')
  @HttpCode(200)
  @UseBefore(validationMiddleware(RecruiterDtoLogIn, 'body'))
  async logIn(@Body() recruiter: RecruiterDtoLogIn) {
    const resRecruiter = await this.recruiterService.logIn(recruiter);
    const token = createTokenRest(resRecruiter, { userType: 'recruiter' });
    return responseWithToken(resRecruiter, token);
  }

  @Get('/')
  @UseBefore(authRecruiterMiddleware)
  async profileInfo(@Req() req: RequestWithRecruiter) {
    const user = new RecruiterDto(req.user);
    return { ...user };
  }
}
