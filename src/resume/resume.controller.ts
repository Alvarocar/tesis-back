import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  ParseIntPipe,
  Query,
  Delete,
} from '@nestjs/common';
import { Role } from 'src/shared/enums/role.enum';
import { SkillService } from 'src/skill/skill.service';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { Roles } from 'src/shared/constants/metadata.constant';
import { LanguageService } from 'src/language/language.service';
import { EducationService } from 'src/education/education.service';
import { ExperienceService } from 'src/experience/experience.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { UpdateAboutMeDto } from './dto/update-about-me-resume.dto';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeService } from './resume.service';
import {
  EducationDto,
  ExperienceDto,
  LanguageDto,
  SkillDto,
} from './dto/resume-detail.dto';

@Roles(Role.Employee)
@Controller('v1/resume')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly languageService: LanguageService,
    private readonly educationService: EducationService,
    private readonly experienceService: ExperienceService,
    private readonly skillService: SkillService,
  ) {}

  @Post()
  @HttpCode(201)
  create(
    @Body() createResumeDto: CreateResumeDto,
    @CurrentUser() user: TokenDto,
  ) {
    return this.resumeService.create(createResumeDto, user);
  }

  @Patch()
  @HttpCode(200)
  updateTitle(
    @Body() updateResumeDto: UpdateResumeDto,
    @CurrentUser() user: TokenDto,
  ) {
    return this.resumeService.updateTitle(updateResumeDto, user);
  }

  @Patch('/about_me')
  @HttpCode(200)
  updateAboutMe(
    @Body() updateAboutMeDto: UpdateAboutMeDto,
    @CurrentUser() user: TokenDto,
  ) {
    return this.resumeService.updateAboutMe(updateAboutMeDto, user);
  }

  @Get('/:id')
  @HttpCode(200)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: TokenDto,
  ) {
    return this.resumeService.findOne(id, user);
  }

  @Get()
  @HttpCode(200)
  findAll(@CurrentUser() user: TokenDto) {
    return this.resumeService.findAll(user);
  }

  @Get('/language/search')
  @HttpCode(200)
  getLanguagesByTerm(@Query('term') term: string) {
    return this.languageService.search(term);
  }

  @Patch('/language/:resumeId')
  @HttpCode(200)
  addOrEditLanguages(
    @Body() languages: LanguageDto[],
    @Param('resumeId') resumeId: number,
    @CurrentUser() user: TokenDto,
  ) {
    return this.languageService.createOrUpdateForApplicant(
      resumeId,
      languages,
      user,
    );
  }

  @Patch('/education/:resumeId')
  @HttpCode(200)
  addOrEditEducation(
    @Body() education: EducationDto,
    @Param('resumeId') resumeId: number,
    @CurrentUser() user: TokenDto,
  ) {
    return this.educationService.createOrUpdate(resumeId, education, user);
  }

  @Delete('/education/:resumeId/:id')
  @HttpCode(204)
  async deleteEducation(
    @CurrentUser() user: TokenDto,
    @Param('resumeId', ParseIntPipe) resumeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.educationService.delete(resumeId, id, user);
  }

  @Patch('/experience/:resumeId')
  @HttpCode(200)
  addOrEditExperience(
    @Body() experienceDto: ExperienceDto,
    @Param('resumeId') resumeId: number,
    @CurrentUser() user: TokenDto,
  ) {
    return this.experienceService.createOrUpdate(resumeId, experienceDto, user);
  }

  @Delete('/experience/:resumeId/:id')
  @HttpCode(204)
  async deleteExperience(
    @CurrentUser() user: TokenDto,
    @Param('resumeId', ParseIntPipe) resumeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.experienceService.delete(resumeId, id, user);
  }

  @Patch('/skills/:resumeId')
  @HttpCode(200)
  updateSkills(
    @Body() skills: SkillDto[],
    @Param('resumeId') resumeId: number,
    @CurrentUser() user: TokenDto,
  ) {
    return this.skillService.createOrUpdateSkillsForApplicant(
      resumeId,
      skills,
      user,
    );
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteResume(
    @CurrentUser() user: TokenDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.resumeService.delete(id, user);
  }
}
