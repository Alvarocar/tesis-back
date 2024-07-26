import { CreateAboutMeDto, CreateResumeDto } from '@/dtos/resume.dto';
import { RequestWithApplicant } from '@/interfaces/auth.interface';
import authApplicantMiddleware from '@/middlewares/authApplicant.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { Applicant } from '@/models/applicant.model';
import { ResumeService } from '@/services/resume.service';
import { Body, Controller, HttpCode, Patch, Post, Put, Req, UseBefore } from 'routing-controllers';

@Controller('/v1/resume')
export class ResumeController {
  resumeService = new ResumeService();

  @Post('/')
  @UseBefore(authApplicantMiddleware)
  @HttpCode(201)
  async createResume(@Body() resume: CreateResumeDto, @Req() req: RequestWithApplicant) {
    await this.resumeService.createResumeWithJustTitle(resume, req.user);
    return { message: 'Hoja de vida creada.' };
  }
  //metodo descripcion//
  @Patch('/about_me')
  @UseBefore(authApplicantMiddleware)
  @UseBefore(validationMiddleware(CreateAboutMeDto, 'body'))
  @HttpCode(200)
  async putDescription(@Body() about: CreateAboutMeDto) {
    await this.resumeService.PutAboutMe(about);
    return { message: 'se ingreso informacion del usuario de manera exitosa.' };
  }
}
