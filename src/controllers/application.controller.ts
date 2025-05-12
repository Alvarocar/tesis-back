import { Controller, Get, Param, Post, Req, UseBefore } from 'routing-controllers';
import authApplicantMiddleware from '@/middlewares/authApplicant.middleware';
import authRecruiterMiddleware from '@/middlewares/authRecluter.middleware';
import { ApplicationService } from '../services/application.service';
import { RequestWithApplicant } from '@/interfaces/auth.interface';

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

  @Get('/is-done/:vacantId/:resumeId')
  @UseBefore(authApplicantMiddleware)
  async isDone(@Param('vacantId') vacantId, @Param('resumeId') resumeId, @Req() req: RequestWithApplicant) {
    const { isDone } = await this.applicationService.isApplicationDone(vacantId, resumeId, req.user);
    return { isDone };
  }

  @Get('/:applicationId')
  @UseBefore(authRecruiterMiddleware)
  async getApplicationDetail(@Param('applicationId') applicationId) {
    return this.applicationService.getApplicationDetail(applicationId);
  }
}
