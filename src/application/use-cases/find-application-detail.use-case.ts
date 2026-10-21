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

        const { applicant } = a.resume;

        /** Geo hydrated (id + nombre) → DTO de geo; null si no hay dato. */
        const geo = (g: { id: number; name: string } | null) =>
          g ? { id: g.id, name: g.name } : null;

        return {
          affinity: a.affinity ?? 0,
          creationDate: DateUtil.toString(a.creationDate),
          feedBack: a.feedBack ?? '',
          id: a.id,
          resume: {
            applicantId: applicant.id,
            aboutMe: a.resume.aboutMe,
            // `title` es un campo de edición del prospecto; se devuelve fiel a
            // la entidad. La vista del reclutador titula con el nombre del
            // aspirante, que viaja en `applicant`.
            title: a.resume.title,
            workModality: a.resume.workModality,
            educations: a.resume.educations.map((edu) => ({
              id: edu.id,
              title: edu.title,
              institute: edu.institute,
              educationLevel: edu.educationLevel,
              programName: edu.programName,
              endDate: edu.endDate ? DateUtil.toString(edu.endDate) : null,
              keepStudy: edu.keepStudy ?? false,
              startDate: DateUtil.toString(edu.startDate),
              country: geo(edu.country),
            })),
            experiences: a.resume.experiences.map((exp) => ({
              id: exp.id,
              rol: exp.rol,
              company: exp.company,
              startDate: DateUtil.toString(exp.startDate),
              endDate: exp.endDate ? DateUtil.toString(exp.endDate) : null,
              description: exp.description,
              keepWorking: exp.keepWorking ?? false,
              country: geo(exp.country),
              department: geo(exp.department),
              city: geo(exp.city),
            })),
            languages: a.resume.languages.map((l) => ({
              id: l.language.id,
              level: l.level,
              name: l.language.name,
            })),
            skills: a.resume.skills.map((s) => ({ id: s.id, name: s.name })),
            knowledge: a.resume.knowledge.map((k) => ({
              id: k.id,
              name: k.name,
            })),
          },
          vacancy: {
            id: a.vacancy.id,
            title: a.vacancy.title,
            description: a.vacancy.description,
            salary: a.vacancy.salaryOffer ?? 0,
            jobType: a.vacancy.jobType as never,
            experienceYears: a.vacancy.experienceYears ?? 0,
            company: a.vacancy.company,
            modificationDate: DateUtil.toString(a.vacancy.modificationDate),
          },
          applicant: {
            id: applicant.id,
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            email: applicant.email,
            phoneNumber: applicant.phoneNumber,
            direction: applicant.direction,
            identification: applicant.identification,
            birthDate: applicant.birthDate
              ? DateUtil.toString(applicant.birthDate)
              : null,
            sex: applicant.sex,
            genre: applicant.genre,
            sexualOrientation: applicant.sexualOrientation,
            ethnicGroup: applicant.ethnicGroup,
            salaryAspiration: applicant.salaryAspiration,
            countryOfBirth: geo(applicant.countryOfBirth),
            departmentOfBirth: geo(applicant.departmentOfBirth),
            cityOfBirth: geo(applicant.cityOfBirth),
            countryOfResidence: geo(applicant.countryOfResidence),
            departmentOfResidence: geo(applicant.departmentOfResidence),
            cityOfResidence: geo(applicant.cityOfResidence),
          },
        } satisfies ApplicationDetailDto;
      },
      { applicationId },
    );
  }
}
