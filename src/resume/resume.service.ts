import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DateUtil } from 'src/shared/utils/date.util';
import { TokenDto } from 'src/shared/security/dto/token.dto';
import { UpdateAboutMeDto } from './dto/update-about-me-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeFactory } from './factory/resume.factory';
import { Resume } from './entities/resume.entity';
import {
  EducationDto,
  ExperienceDto,
  LanguageDto,
  ResumeDetailDto,
} from './dto/resume-detail.dto';
import { OverviewResumeDto } from './dto/overview-resume.dto';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
  ) {}

  async create(createResumeDto: CreateResumeDto, token: TokenDto) {
    const resume = this.resumeRepository.create({
      title: createResumeDto.title,
      experience_years: 0,
      aboutMe: '',
      createDate: new Date(),
      modificationDate: new Date(),
      applicant: {
        id: token.id,
      },
    });

    await this.resumeRepository.insert(resume);
    return { id: resume.id };
  }

  async updateTitle(updateResumeDto: UpdateResumeDto, token: TokenDto) {
    await this.resumeRepository.update(
      { applicant: { id: token.id }, id: updateResumeDto.id },
      { title: updateResumeDto.title },
    );
    return { title: updateResumeDto.title };
  }

  async updateAboutMe(updateAboutMeDto: UpdateAboutMeDto, token: TokenDto) {
    await this.resumeRepository.update(
      { applicant: { id: token.id }, id: updateAboutMeDto.resumeId },
      { aboutMe: updateAboutMeDto.aboutMe },
    );
    return { aboutMe: updateAboutMeDto.aboutMe };
  }

  async findOne(id: number, token: TokenDto) {
    try {
      const resume = await new ResumeFactory(this.resumeRepository)
        .getResumeDetailsQuery(id, token)
        .getOneOrFail();
      return {
        aboutMe: resume.aboutMe,
        educations: resume.educations.map<EducationDto>((ed) => ({
          id: ed.id,
          institute: ed.institute,
          keepStudy: ed.keepStudy ?? false,
          startDate: DateUtil.toString(ed.startDate),
          endDate: ed.endDate && DateUtil.toString(ed.endDate),
          title: ed.title,
        })),
        experiences: resume.experiences.map<ExperienceDto>((ex) => ({
          id: ex.id,
          company: ex.company,
          description: ex.description,
          keepWorking: ex.keepWorking ?? false,
          rol: ex.rol,
          startDate: DateUtil.toString(ex.startDate),
          endDate: ex.endDate && DateUtil.toString(ex.endDate),
        })),
        skills: resume.skills,
        title: resume.title,
        applicantId: resume.applicant.id,
        languages: resume.resumeLanguage.map<LanguageDto>((rlan) => ({
          id: rlan.id,
          level: rlan.languageLevel,
          name: rlan.language.name,
        })),
      } satisfies ResumeDetailDto;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(e.message, e.stack);
      throw new NotFoundException('La hoja de vida no existe');
    }
  }

  async findAll(token: TokenDto) {
    try {
      const resumes = await new ResumeFactory(this.resumeRepository)
        .getResumeOverviewQuery(token.id)
        .getMany();
      return resumes.map<OverviewResumeDto>((resume) => ({
        id: resume.id,
        title: resume.title,
        aboutMe: resume.aboutMe,
      }));
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(e.message, e.stack);
      return [];
    }
  }

  async delete(resumeId: number, user: TokenDto) {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, applicant: { id: user.id } },
    });

    if (!resume) {
      throw new NotFoundException('Hoja de vida no encontrada');
    }

    await this.resumeRepository.remove(resume, { transaction: true });
  }
}
