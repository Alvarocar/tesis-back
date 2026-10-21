import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Resume } from '../entities/resume.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { Country } from 'src/geo/entities/country.entity';
import { Department } from 'src/geo/entities/department.entity';
import { City } from 'src/geo/entities/city.entity';
import type {
  CityDto,
  CountryDto,
  DepartmentDto,
} from 'src/geo/dto/geo-option.dto';
import {
  toCityDto,
  toCountryDto,
  toDepartmentDto,
} from 'src/geo/mappers/geo-row.mapper';
import {
  type CreateResumeData,
  type ResumeDetailHydrated,
  type ResumeOverviewRow,
  type ResumeRepositoryPort,
  type UpdateResumeData,
} from './resume.repository';

/**
 * Ids a resolver, separados por tabla.
 *
 * Cada tabla recibe solo los ids que le corresponden. Un `number[]` por
 * entidad evita pasar un id de `city` a `country`: el `IN` lo filtraria
 * igual (no existe), pero la firma deja de depender de que el caller
 * recuerde de que tabla es cada id.
 */
type GeoIds = {
  countries?: readonly (number | null | undefined)[];
  departments?: readonly (number | null | undefined)[];
  cities?: readonly (number | null | undefined)[];
};

type GeoCatalogs = {
  countries: Map<number, CountryDto | null>;
  departments: Map<number, DepartmentDto | null>;
  cities: Map<number, CityDto | null>;
};

const EMPTY_GEO_CATALOGS = (): GeoCatalogs => ({
  countries: new Map(),
  departments: new Map(),
  cities: new Map(),
});

/**
 * Adapter TypeORM para `ResumeRepositoryPort`.
 * - `select` explícito para evitar over-fetch.
 * - Joins selectivos según operación.
 */
@Injectable()
export class ResumeTypeOrmRepository implements ResumeRepositoryPort {
  private readonly logger = new StructuredLogger('ResumeRepository');

  constructor(
    @InjectRepository(Resume)
    private readonly repo: Repository<Resume>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  /**
   * Resuelve en batch los ids de geo a objetos `CountryDto` /
   * `DepartmentDto` / `CityDto`.
   *
   * Una query por tabla con `IN` en lugar de joins extra por fila: con
   * muchas educaciones/experiencias el join multiplica las filas y el
   * `getOne()` de TypeORM tiene que deduplicar todo en memoria.
   */
  private async loadGeoCatalogs(ids: GeoIds): Promise<GeoCatalogs> {
    const compact = (
      values: readonly (number | null | undefined)[] | undefined,
    ): number[] => [
      ...new Set((values ?? []).filter((id): id is number => id != null)),
    ];

    const countryIds = compact(ids.countries);
    const departmentIds = compact(ids.departments);
    const cityIds = compact(ids.cities);

    if (
      countryIds.length === 0 &&
      departmentIds.length === 0 &&
      cityIds.length === 0
    ) {
      return EMPTY_GEO_CATALOGS();
    }

    const [countries, departments, cities] = await Promise.all([
      countryIds.length
        ? this.countryRepo.find({ where: { id: In(countryIds) } })
        : Promise.resolve([]),
      departmentIds.length
        ? this.departmentRepo.find({
            where: { id: In(departmentIds) },
            relations: { country: true },
          })
        : Promise.resolve([]),
      cityIds.length
        ? this.cityRepo.find({
            where: { id: In(cityIds) },
            relations: { country: true, department: true },
          })
        : Promise.resolve([]),
    ]);

    return {
      countries: new Map(
        countries.map((c) => [
          c.id,
          toCountryDto({ id: c.id, name: c.name, code: c.code }),
        ]),
      ),
      departments: new Map(
        departments.map((d) => [
          d.id,
          toDepartmentDto({
            id: d.id,
            name: d.name,
            code: d.code,
            countryId: d.country.id,
          }),
        ]),
      ),
      cities: new Map(
        cities.map((ct) => [
          ct.id,
          toCityDto({
            id: ct.id,
            name: ct.name,
            type: ct.type,
            countryId: ct.country.id,
            departmentId: ct.department.id,
          }),
        ]),
      ),
    };
  }

  async insert(
    data: CreateResumeData & { creationDate: Date },
  ): Promise<Resume> {
    return this.logger.timed(
      'resume.repo.insert',
      async () => {
        const entity = this.repo.create({
          title: data.title,
          experience_years: 0,
          aboutMe: '',
          workModality: data.workModality ?? null,
          createDate: data.creationDate,
          modificationDate: data.creationDate,
          applicant: { id: data.applicantId } as Resume['applicant'],
        } as unknown as Resume);
        await this.repo.insert(entity);
        return entity;
      },
      {
        title: data.title,
        applicantId: data.applicantId,
        workModality: data.workModality ?? null,
      },
    );
  }

  async update(
    id: number,
    applicantId: number,
    data: UpdateResumeData,
  ): Promise<void> {
    await this.logger.timed(
      'resume.repo.update',
      async () => {
        // El filtro por applicantId evita que se actualice un resume ajeno.
        await this.repo.update({ id, applicant: { id: applicantId } }, data);
      },
      { resumeId: id, applicantId },
    );
  }

  async softDelete(id: number, applicantId: number): Promise<void> {
    await this.logger.timed(
      'resume.repo.softDelete',
      async () => {
        // Hard delete con filtro ownership; cascade real lo gestiona la DB.
        await this.repo.delete({ id, applicant: { id: applicantId } });
      },
      { resumeId: id, applicantId },
    );
  }

  async findDetailByIdAndApplicant(
    id: number,
    applicantId: number,
  ): Promise<ResumeDetailHydrated | null> {
    return this.logger.timed(
      'resume.repo.findDetail',
      async () => {
        const qb = this.repo
          .createQueryBuilder('rs')
          .select([
            'rs.id',
            'rs.title',
            'rs.modificationDate',
            'rs.workModality',
            // La columna física es `description`; TypeORM infiere
            // `about_me` desde el nombre JS y rompe la query. Por eso
            // seleccionamos la columna explícita y le damos un alias.
            'rs.description AS aboutMe',
          ])
          .leftJoin('rs.applicant', 'app')
          .addSelect(['app.id'])
          .where('rs.id = :id', { id })
          .andWhere('app.id = :applicantId', { applicantId });

        // 7 joins selectivos, todos los selects explicitos:
        qb.leftJoin('rs.educations', 'ed').addSelect([
          'ed.id',
          'ed.institute',
          'ed.keepStudy',
          'ed.startDate',
          'ed.endDate',
          'ed.title',
          'ed.educationLevel',
          'ed.programName',
          'ed.countryId',
        ]);
        qb.leftJoin('rs.experiences', 'ex').addSelect([
          'ex.id',
          'ex.rol',
          'ex.company',
          'ex.startDate',
          'ex.endDate',
          'ex.keepWorking',
          'ex.description',
          'ex.countryId',
          'ex.departmentId',
          'ex.cityId',
        ]);
        qb.leftJoin('rs.personal_references', 'pr').addSelect([
          'pr.id',
          'pr.name',
          'pr.phoneNumber',
          'pr.relationship',
        ]);
        qb.leftJoin('rs.laboral_references', 'lr').addSelect([
          'lr.id',
          'lr.name',
          'lr.phoneNumber',
          'lr.rol',
        ]);
        qb.leftJoin('rs.resumeLanguage', 'rlan').addSelect([
          'rlan.id',
          'rlan.languageLevel',
        ]);
        qb.leftJoin('rlan.language', 'lang').addSelect([
          'lang.id',
          'lang.name',
        ]);
        qb.leftJoin('rs.skills', 'sk').addSelect(['sk.id', 'sk.name']);
        qb.leftJoin('rs.knowledge', 'kn').addSelect(['kn.id', 'kn.name']);

        const resume = await qb.getOne();
        if (!resume) return null;

        // Los FKs geo viven como columnas planas en `education`/`experience`,
        // asi que `getOne()` nos devuelve solo los ids. Para exponer los
        // objetos completos (igual que hace el endpoint de applicant) los
        // hidratamos con una segunda query por tabla.
        const educations = resume.educations ?? [];
        const experiences = resume.experiences ?? [];

        const geo = await this.loadGeoCatalogs({
          countries: [
            ...educations.map((ed) => ed.countryId),
            ...experiences.map((ex) => ex.countryId),
          ],
          departments: experiences.map((ex) => ex.departmentId),
          cities: experiences.map((ex) => ex.cityId),
        });

        return {
          id: resume.id,
          title: resume.title,
          aboutMe: resume.aboutMe,
          applicantId: (resume.applicant as { id: number }).id,
          workModality: resume.workModality ?? null,
          educations: (resume.educations ?? []).map((ed) => ({
            id: ed.id,
            institute: ed.institute,
            keepStudy: ed.keepStudy ?? null,
            startDate: ed.startDate,
            endDate: ed.endDate ?? null,
            title: ed.title,
            educationLevel: ed.educationLevel ?? null,
            programName: ed.programName ?? null,
            countryId: ed.countryId ?? null,
            country:
              ed.countryId != null
                ? (geo.countries.get(ed.countryId) ?? null)
                : null,
          })),
          experiences: (resume.experiences ?? []).map((ex) => ({
            id: ex.id,
            company: ex.company,
            description: ex.description,
            keepWorking: ex.keepWorking ?? null,
            rol: ex.rol,
            startDate: ex.startDate,
            endDate: ex.endDate ?? null,
            countryId: ex.countryId ?? null,
            departmentId: ex.departmentId ?? null,
            cityId: ex.cityId ?? null,
            country:
              ex.countryId != null
                ? (geo.countries.get(ex.countryId) ?? null)
                : null,
            department:
              ex.departmentId != null
                ? (geo.departments.get(ex.departmentId) ?? null)
                : null,
            city:
              ex.cityId != null ? (geo.cities.get(ex.cityId) ?? null) : null,
          })),
          languages: (resume.resumeLanguage ?? [])
            .filter((rl) => rl.language)
            .map((rl) => ({
              id: (rl.language as { id: number }).id,
              level: rl.languageLevel,
              name: (rl.language as { name: string }).name,
            })),
          skills: (resume.skills ?? []).map((sk) => ({
            id: sk.id,
            name: sk.name,
          })),
          knowledge: (resume.knowledge ?? []).map((kn) => ({
            id: kn.id,
            name: kn.name,
          })),
        } satisfies ResumeDetailHydrated;
      },
      { resumeId: id, applicantId },
    );
  }

  async listOverviewByApplicant(
    applicantId: number,
  ): Promise<ResumeOverviewRow[]> {
    return this.logger.timed(
      'resume.repo.listOverview',
      async () => {
        return this.repo
          .createQueryBuilder('rs')
          .select([
            'rs.id',
            'rs.title',
            'rs.modificationDate',
            'rs.description AS aboutMe',
          ])
          .leftJoin('rs.applicant', 'app')
          .addSelect(['app.id'])
          .where('app.id = :applicantId', { applicantId })
          .orderBy('rs.modificationDate', 'DESC')
          .getMany();
      },
      { applicantId },
    );
  }

  async existsOwned(id: number, applicantId: number): Promise<boolean> {
    return this.repo.exists({
      where: { id, applicant: { id: applicantId } },
    });
  }

  async validateOwnership(input: {
    resumeId: number;
    applicantId: number;
  }): Promise<boolean> {
    return this.repo.exists({
      where: { id: input.resumeId, applicant: { id: input.applicantId } },
    });
  }
}
