import { validationMiddleware } from '@/middlewares/validation.middleware';
import { responseWithData } from '@/utils/response.util';
import { createTokenRest } from '@/utils/security/token.util';
import { Response } from 'express';
import { Body, Controller, HttpCode, Post, Put, Res, UseBefore } from 'routing-controllers';
import { stubObject } from 'lodash';
import { RecluterService } from '@/services/recluter.service';
import { RecluterDto, RecluterDtoLogIn, RecluterDtoSignUp } from '@/dtos/recluter.dto';
import { ERecluter } from '@/enums/recluter.enum';

@Controller('/v1/recluters')
export class RecluterController {
  private recluterService = new RecluterService();

  @Post('/sign-up')
  @UseBefore(validationMiddleware(RecluterDtoSignUp, 'body'))
  @HttpCode(201)
  async signUp(@Body() recluter: RecluterDtoSignUp, @Res() res: Response) {
    const result = await this.recluterService.signUp(recluter);
    const newRecluter = new RecluterDto({ ...result });
    res.setHeader('Authorization', createTokenRest(newRecluter, { userType: 'recruiter' }));
    return responseWithData(newRecluter, { message: ERecluter.SIGN_UP });
  }

  @Put('/sign-in')
  @HttpCode(204)
  @UseBefore(validationMiddleware(RecluterDtoLogIn, 'body'))
  async logIn(@Body() recluter: RecluterDtoLogIn, @Res() res: Response) {
    res.setHeader('Authorization', createTokenRest(await this.recluterService.logIn(recluter), { userType: 'recruiter' }));
    return stubObject();
  }
}
