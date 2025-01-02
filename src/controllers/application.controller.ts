import { Body, Controller, Post, Req, UseBefore } from 'routing-controllers';
import authApplicantMiddleware from '@/middlewares/authApplicant.middleware';
import { ApplicationService } from '../services/application.service';
import { RequestWithApplicant } from '@/interfaces/auth.interface';
import { ApplicationDto } from '@/dtos/application.dto';

@Controller('/application')
export class ApplicantionController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  @Post('/apply')
  @UseBefore(authApplicantMiddleware)
  async applyToVacant(@Body() application: ApplicationDto, @Req() req: RequestWithApplicant) {
    await this.applicationService.apply(application, req.user);
    return { applied: true };
  }
}
