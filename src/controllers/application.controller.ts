import { Controller, Param, Post, Req, UseBefore } from 'routing-controllers';
import authApplicantMiddleware from '@/middlewares/authApplicant.middleware';
import { RequestWithApplicant } from '@/interfaces/auth.interface';
import { ApplicationService } from '../services/application.service';

@Controller('/v1/application')
export class ApplicantionController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  @Post('/apply/:vacantId/:resumeId')
  @UseBefore(authApplicantMiddleware)
  async applyToVacant(@Param('vacantId') vacantId, @Param('resumeId') resumeId, @Req() req: RequestWithApplicant) {
    await this.applicationService.apply({ resumeId, vacantId }, req.user);
    return { applied: true };
  }
}
