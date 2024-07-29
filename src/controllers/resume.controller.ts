import { CreateAboutMeDto, CreateResumeDto } from '@/dtos/resume.dto';
import { RequestWithApplicant } from '@/interfaces/auth.interface';
import authApplicantMiddleware from '@/middlewares/authApplicant.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { ResumeService } from '@/services/resume.service';
import { Body, Controller, Get, HttpCode, Param, Patch, Post, Req, UseBefore } from 'routing-controllers';

@Controller('/v1/resume')
export class ResumeController {
  resumeService = new ResumeService();

  @Post('/')
  @UseBefore(authApplicantMiddleware)
  @HttpCode(201)
  async createResume(@Body() resume: CreateResumeDto, @Req() req: RequestWithApplicant) {
    const resp = await this.resumeService.createResumeWithJustTitle(resume, req.user);
    return { id: resp.id };
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
  //metodo obtener una hoja de vida por el id//
  @Get('/:id')
  @UseBefore(authApplicantMiddleware)
  @HttpCode(200)
  getResumeById(@Param('id') id: number) {
    return { message: 'ok' };
  }

  @Get('/')
  @UseBefore(authApplicantMiddleware)
  @HttpCode(200)
  async getResumesByUser(@Req() req: RequestWithApplicant) {
    const resumes = await this.resumeService.getResumes(req.user.id);
    return resumes;
  }
}
