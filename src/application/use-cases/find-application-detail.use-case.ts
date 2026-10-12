import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { DateUtil } from 'src/shared/utils/date.util';
import type { ApplicationDetailDto } from '../dto/application-detail.dto';
import {
  APPLICATION_REPOSITORY,
  type ApplicationRepositoryPort,
} from '../repositories/application.repository';

/**
 * Use-case: devuelve el detalle de una application hidratada para
 * inspection / benchmark.
 */
@Injectable()
export class FindApplicationDetailUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepo: ApplicationRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(applicationId: number): Promise<ApplicationDetailDto> {
    return this.logger.timed(
      'application.detail',
      async () => {
        const a = await this.applicationRepo.findHydratedForAI(applicationId);
        if (!a) throw new NotFoundError('Application', applicationId);

        return {
          affinity: a.affinity ?? 0,
          creationDate: DateUtil.toString(a.creationDate),
          feedBack: a.feedBack ?? '',
          id: a.id,
          resume: {
            applicantId: a.resume.applicant.id,
            aboutMe: a.resume.aboutMe,
            title:
              `${a.resume.applicant.firstName} ${a.resume.applicant.lastName ?? ''}`.trim(),
            educations: a.resume.educations.map((edu) => ({
              id: edu.id,
              title: edu.title,
              endDate: edu.endDate ? DateUtil.toString(edu.endDate) : undefined,
              institute: edu.institute,
              keepStudy: edu.keepStudy ?? false,
              startDate: DateUtil.toString(edu.startDate),
            })),
            experiences: a.resume.experiences.map((exp) => ({
              id: exp.id,
              rol: exp.rol,
              company: exp.company,
              startDate: DateUtil.toString(exp.startDate),
              endDate: exp.endDate ? DateUtil.toString(exp.endDate) : undefined,
              description: exp.description,
              keepWorking: exp.keepWorking ?? false,
            })),
            languages: a.resume.languages.map((l) => ({
              id: l.language.id,
              level: l.level,
              name: l.language.name,
            })),
            skills: a.resume.skills.map((s) => ({ id: s.id, name: s.name })),
          },
          vacancy: {
            id: a.vacancy.id,
            title: a.vacancy.title,
            description: a.vacancy.description,
            salary: a.vacancy.salaryOffer ?? 0,
            jobType: a.vacancy.jobType as never,
            experienceYears: a.vacancy.experienceYears ?? 0,
          },
          applicant: {
            firstName: a.resume.applicant.firstName,
            lastName: a.resume.applicant.lastName ?? '',
            phoneNumber: a.resume.applicant.phoneNumber ?? '',
          },
        } satisfies ApplicationDetailDto;
      },
      { applicationId },
    );
  }
}
