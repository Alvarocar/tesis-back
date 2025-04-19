import { CreateAboutMeDto, CreateResumeDto, EducationDto, ExperienceDto, LanguageDto, SkillDto } from '@/dtos/resume.dto';
import { RequestWithApplicant } from '@/interfaces/auth.interface';
import authApplicantMiddleware from '@/middlewares/authApplicant.middleware';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { EducationService } from '@/services/education.service';
import { ExperienceService } from '@/services/experience.service';
import { LanguageService } from '@/services/language.service';
import { ResumeService } from '@/services/resume.service';
import { SkillService } from '@/services/skill.service';
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, QueryParam, Req, UseBefore } from 'routing-controllers';

@Controller('/v1/resume')
export class ResumeController {
  resumeService = new ResumeService();
  languageService = new LanguageService();
  educationService = new EducationService();
  experienceService = new ExperienceService();
  skillService = new SkillService();

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
  async putDescription(@Body() about: CreateAboutMeDto, @Req() req: RequestWithApplicant) {
    const result = await this.resumeService.PutAboutMe(about, req.user);
    return { aboutMe: result.aboutMe };
  }
  //metodo obtener una hoja de vida por el id//
  @Get('/:id')
  @UseBefore(authApplicantMiddleware)
  @HttpCode(200)
  getResumeById(@Param('id') id: number, @Req() req: RequestWithApplicant) {
    return this.resumeService.getResumeById(id, req.user);
  }

  @Get('/')
  @UseBefore(authApplicantMiddleware)
  @HttpCode(200)
  async getResumesByUser(@Req() req: RequestWithApplicant) {
    const resumes = await this.resumeService.getResumes(req.user.id);
    return resumes;
  }

  @Get('/language/search')
  getLanguagesByTerm(@QueryParam('term') term: string) {
    return this.languageService.getLanguageByTerm(term);
  }

  @Patch('/education/:resumeId')
  @UseBefore(authApplicantMiddleware)
  addOrEditEducation(@Body() education: EducationDto, @Param('resumeId') resumeId: number, @Req() req: RequestWithApplicant) {
    return this.educationService.createOrUpdate(education, req.user, resumeId);
  }

  @Patch('/experience/:resumeId')
  @UseBefore(authApplicantMiddleware)
  addOrEditExperience(@Body() experience: ExperienceDto, @Param('resumeId') resumeId: number, @Req() req: RequestWithApplicant) {
    return this.experienceService.addOrEdit(experience, req.user, resumeId);
  }

  @Patch('/language/:resumeId')
  @UseBefore(authApplicantMiddleware)
  updateLanguage(@Body() languages: LanguageDto[], @Param('resumeId') resumeId: number, @Req() req: RequestWithApplicant) {
    return this.languageService.updateLanguages(languages, resumeId, req.user);
  }

  @Patch('/skill/:resumeId')
  @UseBefore(authApplicantMiddleware)
  updateSkills(@Body() skills: SkillDto[], @Param('resumeId') resumeId: number, @Req() req: RequestWithApplicant) {
    return this.skillService.updateSkills(skills, resumeId, req.user);
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseBefore(authApplicantMiddleware)
  deleteResume(@Req() req: RequestWithApplicant, @Param('id') id: number) {
    return this.resumeService.deleteResume(req.user, id);
  }

  @Delete('/education/:resumeId/:id')
  @HttpCode(204)
  @UseBefore(authApplicantMiddleware)
  async deleteEducation(@Req() req: RequestWithApplicant, @Param('resumeId') resumeId: number, @Param('id') id: number) {
    await this.educationService.deleteEducation(req.user, resumeId, id);
    return { message: 'ok' };
  }
}
