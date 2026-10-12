import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { DateUtil } from 'src/shared/utils/date.util';
import type {
  EducationDto,
  ExperienceDto,
  LanguageDto,
  ResumeDetailDto,
  SkillDto,
} from '../dto/resume-detail.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from '../repositories/resume.repository';

/**
 * Use-case: obtener detalle de un resume del applicant autenticado.
 */
@Injectable()
export class FindResumeUseCase {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(id: number, user: TokenDto): Promise<ResumeDetailDto> {
    return this.logger.timed(
      'resume.findOne',
      async () => {
        const resume = await this.resumeRepo.findDetailByIdAndApplicant(
          id,
          user.id,
        );
        if (!resume) throw new NotFoundError('Resume', id);

        return {
          aboutMe: resume.aboutMe,
          educations: resume.educations.map<EducationDto>((ed) => ({
            id: ed.id,
            institute: ed.institute,
            keepStudy: ed.keepStudy ?? false,
            startDate: DateUtil.toString(ed.startDate),
            endDate: ed.endDate ? DateUtil.toString(ed.endDate) : undefined,
            title: ed.title,
          })),
          experiences: resume.experiences.map<ExperienceDto>((ex) => ({
            id: ex.id,
            company: ex.company,
            description: ex.description,
            keepWorking: ex.keepWorking ?? false,
            rol: ex.rol,
            startDate: DateUtil.toString(ex.startDate),
            endDate: ex.endDate ? DateUtil.toString(ex.endDate) : undefined,
          })),
          skills: resume.skills.map<SkillDto>((sk) => ({
            id: sk.id,
            name: sk.name,
          })),
          title: resume.title,
          applicantId: resume.applicantId,
          languages: resume.languages.map<LanguageDto>((lang) => ({
            id: lang.id,
            level: lang.level,
            name: lang.name,
          })),
        } satisfies ResumeDetailDto;
      },
      { resumeId: id, applicantId: user.id },
    );
  }
}
