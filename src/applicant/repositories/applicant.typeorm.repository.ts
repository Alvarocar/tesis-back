import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Applicant } from '../entities/applicant.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  type ApplicantOverview,
  type ApplicantRepositoryPort,
  type CreateApplicantData,
  type UpdateApplicantData,
} from './applicant.repository';
import {
  toCityDto,
  toCountryDto,
  toDepartmentDto,
} from 'src/geo/mappers/geo-row.mapper';

/**
 * Adapter TypeORM para `ApplicantRepositoryPort`.
 * Encapsula todas las queries del feature Applicant.
 */
@Injectable()
export class ApplicantTypeOrmRepository implements ApplicantRepositoryPort {
  private readonly logger = new StructuredLogger('ApplicantRepository');

  constructor(
    @InjectRepository(Applicant)
    private readonly repo: Repository<Applicant>,
  ) {}

  async insert(
    data: CreateApplicantData & { creationDate: Date },
  ): Promise<Applicant> {
    return this.logger.timed(
      'applicant.repo.insert',
      async () => {
        const entity = this.repo.create({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName ?? null,
          creationDate: data.creationDate,
          modificationDate: data.creationDate,
          isActive: true,
        } as unknown as Applicant);
        await this.repo.insert(entity);
        return entity;
      },
      { email: data.email },
    );
  }

  async update(id: number, data: UpdateApplicantData): Promise<void> {
    await this.logger.timed(
      'applicant.repo.update',
      async () => {
        await this.repo.update({ id }, data);
      },
      { applicantId: id },
    );
  }

  async softDelete(id: number): Promise<void> {
    await this.logger.timed(
      'applicant.repo.softDelete',
      async () => {
        await this.repo.update({ id }, { isActive: false });
      },
      { applicantId: id },
    );
  }

  async findById(id: number): Promise<Applicant | null> {
    return this.logger.timed(
      'applicant.repo.findById',
      async () => {
        return this.repo.findOne({ where: { id } });
      },
      { applicantId: id },
    );
  }

  async findByEmail(email: string): Promise<Applicant | null> {
    return this.logger.timed(
      'applicant.repo.findByEmail',
      async () => {
        return this.repo.findOne({ where: { email } });
      },
      { email },
    );
  }

  async findByInvitationToken(token: string): Promise<Applicant | null> {
    return this.logger.timed(
      'applicant.repo.findByInvitationToken',
      async () => {
        return this.repo.findOne({
          where: {
            invitationToken: token,
            invitationTokenExpires: MoreThan(new Date()),
          },
        });
      },
      { token: 'redacted' },
    );
  }

  async findByIdOverview(id: number): Promise<ApplicantOverview | null> {
    return this.logger.timed(
      'applicant.repo.findByIdOverview',
      async () => {
        const { entities, raw } = await this.repo
          .createQueryBuilder('applicant')
          .select([
            'applicant.id',
            'applicant.firstName',
            'applicant.lastName',
            'applicant.email',
            'applicant.password',
            'applicant.identification',
            'applicant.phoneNumber',
            'applicant.birthDate',
            'applicant.direction',
            'applicant.countryOfBirthId',
            'applicant.departmentOfBirthId',
            'applicant.cityOfBirthId',
            'applicant.countryOfResidenceId',
            'applicant.departmentOfResidenceId',
            'applicant.cityOfResidenceId',
            'applicant.sex',
            'applicant.genre',
            'applicant.sexualOrientation',
            'applicant.ethnicGroup',
            'applicant.salaryAspiration',
          ])
          .leftJoin('country', 'cob', 'cob.id = applicant.country_of_birth_id')
          .leftJoin(
            'department',
            'dob',
            'dob.id = applicant.department_of_birth_id',
          )
          .leftJoin('city', 'cib', 'cib.id = applicant.city_of_birth_id')
          .leftJoin(
            'country',
            'cor',
            'cor.id = applicant.country_of_residence_id',
          )
          .leftJoin(
            'department',
            'dor',
            'dor.id = applicant.department_of_residence_id',
          )
          .leftJoin('city', 'cir', 'cir.id = applicant.city_of_residence_id')
          .addSelect([
            'cob.id',
            'cob.name',
            'cob.code',
            'dob.id',
            'dob.name',
            'dob.code',
            'dob.country_id',
            'cib.id',
            'cib.name',
            'cib.type',
            'cib.country_id',
            'cib.department_id',
            'cor.id',
            'cor.name',
            'cor.code',
            'dor.id',
            'dor.name',
            'dor.code',
            'dor.country_id',
            'cir.id',
            'cir.name',
            'cir.type',
            'cir.country_id',
            'cir.department_id',
          ])
          .where('applicant.id = :id', { id })
          .getRawAndEntities();

        if (!entities[0] || !raw[0]) return null;
        const entity = entities[0];
        const row = raw[0];

        // getRawAndEntities returns the raw row keys as <alias>_<column>.
        // Country/department/city columns are flat scalars (e.g. cob_id,
        // dob_country_id, cib_type) so we group them into per-DTO objects
        // before mapping.
        const countryOfBirthRaw = {
          id: row.cob_id,
          name: row.cob_name,
          code: row.cob_code,
        };
        const departmentOfBirthRaw = {
          id: row.dob_id,
          name: row.dob_name,
          code: row.dob_code,
          country_id: row.dob_country_id,
        };
        const cityOfBirthRaw = {
          id: row.cib_id,
          name: row.cib_name,
          type: row.cib_type,
          country_id: row.cib_country_id,
          department_id: row.cib_department_id,
        };
        const countryOfResidenceRaw = {
          id: row.cor_id,
          name: row.cor_name,
          code: row.cor_code,
        };
        const departmentOfResidenceRaw = {
          id: row.dor_id,
          name: row.dor_name,
          code: row.dor_code,
          country_id: row.dor_country_id,
        };
        const cityOfResidenceRaw = {
          id: row.cir_id,
          name: row.cir_name,
          type: row.cir_type,
          country_id: row.cir_country_id,
          department_id: row.cir_department_id,
        };

        return {
          ...(entity as unknown as ApplicantOverview),
          countryOfBirth: toCountryDto(countryOfBirthRaw),
          departmentOfBirth: toDepartmentDto(departmentOfBirthRaw),
          cityOfBirth: toCityDto(cityOfBirthRaw),
          countryOfResidence: toCountryDto(countryOfResidenceRaw),
          departmentOfResidence: toDepartmentDto(departmentOfResidenceRaw),
          cityOfResidence: toCityDto(cityOfResidenceRaw),
        } as unknown as ApplicantOverview;
      },
      { applicantId: id },
    );
  }

  async setPasswordResetToken(
    id: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repo.update(
      { id },
      {
        invitationToken: token,
        invitationTokenExpires: expiresAt,
      },
    );
  }

  async clearPasswordResetToken(id: number): Promise<void> {
    await this.repo.update(
      { id },
      {
        invitationToken: null,
        invitationTokenExpires: null,
      },
    );
  }
}
