import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { EApplicationStatus } from 'src/shared/enums/application-status.enum';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { Country } from 'src/geo/entities/country.entity';
import { Department } from 'src/geo/entities/department.entity';
import { City } from 'src/geo/entities/city.entity';
import type { VacancyJobType } from 'src/shared/enums/vacancy-job-type.enum';
import type { EEducationLevel } from 'src/shared/enums/education-level.enum';
import type { ESex } from 'src/shared/enums/sex.enum';
import type { EGender } from 'src/shared/enums/gender.enum';
import type { ESexualOrientation } from 'src/shared/enums/sexual-orientation.enum';
import type { EEthnicGroup } from 'src/shared/enums/ethnic-group.enum';
import type {
  ApplicantHydratedForAI,
  ApplicationHydratedForAI,
  ApplicationRepositoryPort,
  CreateApplicationData,
  GeoHydratedForAI,
  UpdateAnalysisData,
} from './application.repository';

/** Par geo listo para el DTO: `{ id, name }` o `null`. */
const geoName = (
  id: number | null | undefined,
  name: string | null,
): GeoHydratedForAI | null => (id != null && name ? { id, name } : null);

/** Filas parciales que devuelve el `addSelect` explícito del QB. */
type EducationRow = {
  id: number;
  title: string;
  institute: string;
  educationLevel: EEducationLevel | null;
  programName: string | null;
  keepStudy: boolean | null;
  startDate: Date;
  endDate: Date | null;
  countryId: number | null;
};

type ExperienceRow = {
  id: number;
  rol: string;
  company: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  keepWorking: boolean | null;
  countryId: number | null;
  departmentId: number | null;
  cityId: number | null;
};

type ApplicantRow = {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  direction: string | null;
  identification: string | null;
  birthDate: Date | null;
  sex: ESex | null;
  genre: EGender | null;
  sexualOrientation: ESexualOrientation | null;
  ethnicGroup: EEthnicGroup | null;
  salaryAspiration: number | null;
  countryOfBirthId: number | null;
  departmentOfBirthId: number | null;
  cityOfBirthId: number | null;
  countryOfResidenceId: number | null;
  departmentOfResidenceId: number | null;
  cityOfResidenceId: number | null;
};

type ResumeRow = {
  id: number;
  aboutMe: string;
  title: string;
  modificationDate: Date;
  workModality: VacancyJobType | null;
  applicant: ApplicantRow;
  educations: EducationRow[];
  experiences: ExperienceRow[];
  resumeLanguage: {
    id: number;
    languageLevel: number;
    language: { id: number; name: string };
  }[];
  skills: { id: number; name: string }[];
  knowledge: { id: number; name: string }[];
};

type VacancyRow = {
  id: number;
  title: string;
  description: string;
  salaryOffer: number | null;
  jobType: string;
  experienceYears: number | null;
  modificationDate: Date;
  employee?: { company?: { name?: string } } | null;
};

/**
 * Adapter TypeORM para `ApplicationRepositoryPort`.
 * - `findHydratedForAI`: una sola query con `addSelect` explícitos.
 * - `searchByVacancy`: pagination + select + joins selectivos.
 * - Logging estructurado en cada operación.
 */
@Injectable()
export class ApplicationTypeOrmRepository implements ApplicationRepositoryPort {
  private readonly logger = new StructuredLogger('ApplicationRepository');

  // Implementado por required abstract port (TS quirk)
  Application = Application;

  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async insert(data: CreateApplicationData): Promise<{ id: number }> {
    return this.logger.timed(
      'application.repo.insert',
      async () => {
        const entity = this.repo.create({
          resume: { id: data.resumeId } as Application['resume'],
          vacancy: { id: data.vacancyId } as Application['vacancy'],
          status: data.status,
          creationDate: data.creationDate,
        } as unknown as Application);
        await this.repo.insert(entity);
        return { id: entity.id };
      },
      { vacancyId: data.vacancyId, resumeId: data.resumeId },
    );
  }

  async findHydratedForAI(
    applicationId: number,
  ): Promise<ApplicationHydratedForAI | null> {
    return this.logger.timed(
      'application.repo.hydrate',
      async () => {
        const qb = this.repo
          .createQueryBuilder('a')
          .select([
            'a.id',
            'a.status',
            'a.affinity',
            'a.feedBack',
            'a.creationDate',
          ])
          .leftJoin('a.resume', 'rs')
          .addSelect([
            'rs.id',
            'rs.description AS aboutMe',
            'rs.title',
            'rs.workModality',
            'rs.modificationDate',
          ])
          .leftJoin('rs.applicant', 'app')
          .addSelect([
            'app.id',
            'app.firstName',
            'app.lastName',
            'app.email',
            'app.phoneNumber',
            'app.direction',
            'app.identification',
            'app.birthDate',
            'app.sex',
            'app.genre',
            'app.sexualOrientation',
            'app.ethnicGroup',
            'app.salaryAspiration',
            'app.countryOfBirthId',
            'app.departmentOfBirthId',
            'app.cityOfBirthId',
            'app.countryOfResidenceId',
            'app.departmentOfResidenceId',
            'app.cityOfResidenceId',
          ])
          .leftJoin('rs.educations', 'ed')
          .addSelect([
            'ed.id',
            'ed.title',
            'ed.institute',
            'ed.educationLevel',
            'ed.programName',
            'ed.keepStudy',
            'ed.startDate',
            'ed.endDate',
            'ed.countryId',
          ])
          .leftJoin('rs.experiences', 'ex')
          .addSelect([
            'ex.id',
            'ex.rol',
            'ex.company',
            'ex.startDate',
            'ex.endDate',
            'ex.description',
            'ex.keepWorking',
            'ex.countryId',
            'ex.departmentId',
            'ex.cityId',
          ])
          .leftJoin('rs.resumeLanguage', 'rlan')
          .addSelect(['rlan.id', 'rlan.languageLevel'])
          .leftJoin('rlan.language', 'lang')
          .addSelect(['lang.id', 'lang.name'])
          .leftJoin('rs.skills', 'sk')
          .addSelect(['sk.id', 'sk.name'])
          .leftJoin('rs.knowledge', 'kn')
          .addSelect(['kn.id', 'kn.name'])
          .leftJoin('a.vacancy', 'v')
          .addSelect([
            'v.id',
            'v.title',
            'v.description',
            'v.salaryOffer',
            'v.jobType',
            'v.experienceYears',
            'v.modificationDate',
          ])
          .leftJoin('v.employee', 'vemp')
          .addSelect(['vemp.id'])
          .leftJoin('vemp.company', 'vco')
          .addSelect(['vco.id', 'vco.name'])
          .where('a.id = :id', { id: applicationId });

        const a = await qb.getOne();
        if (!a) return null;

        const rs = a.resume as unknown as ResumeRow;
        const app = rs.applicant;
        const vac = a.vacancy as unknown as VacancyRow;
        const educations = rs.educations ?? [];
        const experiences = rs.experiences ?? [];

        /**
         * Geo en batch: una query por tabla con `IN` en vez de joins extra por
         * fila. Con muchas educaciones/experiencias el join multiplica filas
         * y obliga a `getOne()` a deduplicar todo en memoria. Mismo criterio
         * que `ResumeTypeOrmRepository.loadGeoCatalogs`.
         */
        const countryIds = [
          app.countryOfBirthId,
          app.countryOfResidenceId,
          ...educations.map((e) => e.countryId),
          ...experiences.map((e) => e.countryId),
        ];
        const departmentIds = [
          app.departmentOfBirthId,
          app.departmentOfResidenceId,
          ...experiences.map((e) => e.departmentId),
        ];
        const cityIds = [
          app.cityOfBirthId,
          app.cityOfResidenceId,
          ...experiences.map((e) => e.cityId),
        ];

        const unique = (values: (number | null | undefined)[]) => [
          ...new Set(values.filter((v): v is number => v != null)),
        ];

        const [countries, departments, cities] = await Promise.all([
          unique(countryIds).length
            ? this.countryRepo.find({ where: { id: In(unique(countryIds)) } })
            : Promise.resolve([]),
          unique(departmentIds).length
            ? this.departmentRepo.find({
                where: { id: In(unique(departmentIds)) },
              })
            : Promise.resolve([]),
          unique(cityIds).length
            ? this.cityRepo.find({ where: { id: In(unique(cityIds)) } })
            : Promise.resolve([]),
        ]);

        const countryName = new Map(countries.map((c) => [c.id, c.name]));
        const departmentName = new Map(departments.map((d) => [d.id, d.name]));
        const cityName = new Map(cities.map((c) => [c.id, c.name]));

        /** Nombre geo por id, o null si no hay dato. */
        const geo = (
          id: number | null | undefined,
          catalog: Map<number, string>,
        ) => (id != null && catalog.has(id) ? catalog.get(id)! : null);

        return {
          id: a.id,
          status: a.status as typeof EApplicationStatus.APPLIED,
          affinity: a.affinity ?? null,
          feedBack: a.feedBack ?? null,
          creationDate: a.creationDate,
          resume: {
            id: rs.id,
            aboutMe: rs.aboutMe,
            title: rs.title,
            modificationDate: rs.modificationDate,
            workModality: rs.workModality,
            applicant: {
              id: app.id,
              firstName: app.firstName,
              lastName: app.lastName ?? null,
              email: app.email,
              phoneNumber: app.phoneNumber ?? null,
              direction: app.direction ?? null,
              identification: app.identification ?? null,
              birthDate: app.birthDate ?? null,
              sex: app.sex,
              genre: app.genre,
              sexualOrientation: app.sexualOrientation,
              ethnicGroup: app.ethnicGroup,
              salaryAspiration: app.salaryAspiration ?? null,
              countryOfBirth: geoName(
                app.countryOfBirthId,
                geo(app.countryOfBirthId, countryName),
              ),
              departmentOfBirth: geoName(
                app.departmentOfBirthId,
                geo(app.departmentOfBirthId, departmentName),
              ),
              cityOfBirth: geoName(
                app.cityOfBirthId,
                geo(app.cityOfBirthId, cityName),
              ),
              countryOfResidence: geoName(
                app.countryOfResidenceId,
                geo(app.countryOfResidenceId, countryName),
              ),
              departmentOfResidence: geoName(
                app.departmentOfResidenceId,
                geo(app.departmentOfResidenceId, departmentName),
              ),
              cityOfResidence: geoName(
                app.cityOfResidenceId,
                geo(app.cityOfResidenceId, cityName),
              ),
            },
            educations: educations.map((edu) => ({
              id: edu.id,
              title: edu.title,
              institute: edu.institute,
              educationLevel: edu.educationLevel ?? null,
              programName: edu.programName ?? null,
              keepStudy: edu.keepStudy ?? null,
              startDate: edu.startDate,
              endDate: edu.endDate ?? null,
              country: geoName(edu.countryId, geo(edu.countryId, countryName)),
            })),
            experiences: experiences.map((exp) => ({
              id: exp.id,
              rol: exp.rol,
              company: exp.company,
              startDate: exp.startDate,
              endDate: exp.endDate ?? null,
              description: exp.description,
              keepWorking: exp.keepWorking ?? null,
              country: geoName(exp.countryId, geo(exp.countryId, countryName)),
              department: geoName(
                exp.departmentId,
                geo(exp.departmentId, departmentName),
              ),
              city: geoName(exp.cityId, geo(exp.cityId, cityName)),
            })),
            languages: (rs.resumeLanguage ?? []).map((rl) => ({
              id: rl.id,
              level: rl.languageLevel,
              language: rl.language as { id: number; name: string },
            })),
            skills: rs.skills ?? [],
            knowledge: rs.knowledge ?? [],
          },
          vacancy: {
            id: vac.id,
            title: vac.title,
            description: vac.description,
            salaryOffer: vac.salaryOffer ?? null,
            jobType: vac.jobType,
            experienceYears: vac.experienceYears ?? null,
            modificationDate: vac.modificationDate,
            company: vac.employee?.company?.name ?? null,
          },
        } satisfies ApplicationHydratedForAI;
      },
      { applicationId },
    );
  }

  async searchByVacancy(
    vacancyId: number,
    pagination: { page: number; pageSize: number },
  ) {
    return this.logger.timed(
      'application.repo.searchByVacancy',
      async () => {
        const [data, total] = await this.repo
          .createQueryBuilder('a')
          .select([
            'a.id',
            'a.status',
            'a.feedBack',
            'a.affinity',
            'a.creationDate',
          ])
          .leftJoin('a.resume', 'rs')
          .addSelect(['rs.id'])
          .leftJoin('rs.applicant', 'app')
          .addSelect(['app.id', 'app.firstName', 'app.lastName'])
          .leftJoin('a.vacancy', 'v')
          .addSelect(['v.id', 'v.title'])
          .where('v.id = :vacancyId', { vacancyId })
          .orderBy('a.creationDate', 'DESC')
          .take(pagination.pageSize)
          .skip((pagination.page - 1) * pagination.pageSize)
          .getManyAndCount();
        return { data, total };
      },
      { vacancyId },
    );
  }

  async listAnalyzed() {
    return this.logger.timed(
      'application.repo.listAnalyzed',
      async () => {
        const rows = await this.repo
          .createQueryBuilder('a')
          .select([
            'a.id',
            'a.creationDate',
            'v.title',
            'app.firstName',
            'app.lastName',
          ])
          .leftJoin('a.vacancy', 'v')
          .leftJoin('a.resume', 'rs')
          .leftJoin('rs.applicant', 'app')
          .where('a.status = :status', { status: EApplicationStatus.ANALYZED })
          .orderBy('a.creationDate', 'DESC')
          .getRawMany<{
            a_id: number;
            a_creationDate: Date;
            v_title: string | null;
            app_firstName: string | null;
            app_lastName: string | null;
          }>();
        return rows.map((r) => ({
          id: r.a_id,
          creationDate: r.a_creationDate,
          vacancyTitle: r.v_title ?? '',
          applicantName:
            `${r.app_firstName ?? ''} ${r.app_lastName ?? ''}`.trim(),
        }));
      },
      {},
    );
  }

  async updateAnalysisResults(
    applicationId: number,
    data: UpdateAnalysisData,
  ): Promise<boolean> {
    return this.logger.timed(
      'application.repo.updateAnalysisResults',
      async () => {
        const result = await this.repo
          .createQueryBuilder()
          .update('application')
          .set({
            affinity: data.affinity,
            feedBack: data.feedBack,
            iaTimeTaken: data.iaTimeTaken,
            status: data.status,
            inputTokens: data.inputTokens,
            outputTokens: data.outputTokens,
            aiModel: {
              id: data.aiModelId,
            } as unknown as Application['aiModel'],
          })
          .where('id = :id', { id: applicationId })
          .execute();
        return (result.affected ?? 0) > 0;
      },
      { applicationId },
    );
  }

  async existsForResumeAndVacancy(
    resumeId: number,
    vacancyId: number,
  ): Promise<boolean> {
    return this.repo.exists({
      where: {
        resume: { id: resumeId },
        vacancy: { id: vacancyId },
      },
    });
  }
}
