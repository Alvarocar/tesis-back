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
        const row = await this.repo
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
          // Six correlated sub-queries, each returning a single JSONB value.
          // jsonb_build_object accepts any-typed args (unlike the legacy
          // json_object(text, text)), so department.country_id and
          // city.country_id/department_id round-trip cleanly. The result for
          // each alias is either a JSONB object or NULL when the FK is null.
          .addSelect(
            `(SELECT jsonb_build_object('id', c.id, 'name', c.name, 'code', c.code)
                FROM country c
                WHERE c.id = applicant.country_of_birth_id
                LIMIT 1)`,
            'country_of_birth',
          )
          .addSelect(
            `(SELECT jsonb_build_object('id', d.id, 'name', d.name, 'code', d.code, 'countryId', d.country_id)
                FROM department d
                WHERE d.id = applicant.department_of_birth_id
                LIMIT 1)`,
            'department_of_birth',
          )
          .addSelect(
            `(SELECT jsonb_build_object('id', ct.id, 'name', ct.name, 'type', ct.type, 'countryId', ct.country_id, 'departmentId', ct.department_id)
                FROM city ct
                WHERE ct.id = applicant.city_of_birth_id
                LIMIT 1)`,
            'city_of_birth',
          )
          .addSelect(
            `(SELECT jsonb_build_object('id', c.id, 'name', c.name, 'code', c.code)
                FROM country c
                WHERE c.id = applicant.country_of_residence_id
                LIMIT 1)`,
            'country_of_residence',
          )
          .addSelect(
            `(SELECT jsonb_build_object('id', d.id, 'name', d.name, 'code', d.code, 'countryId', d.country_id)
                FROM department d
                WHERE d.id = applicant.department_of_residence_id
                LIMIT 1)`,
            'department_of_residence',
          )
          .addSelect(
            `(SELECT jsonb_build_object('id', ct.id, 'name', ct.name, 'type', ct.type, 'countryId', ct.country_id, 'departmentId', ct.department_id)
                FROM city ct
                WHERE ct.id = applicant.city_of_residence_id
                LIMIT 1)`,
            'city_of_residence',
          )
          .where('applicant.id = :id', { id })
          .getRawOne();

        if (!row) return null;

        const parseJsonb = (raw: unknown): Record<string, unknown> | null => {
          if (raw == null) return null;
          if (typeof raw === 'string') {
            return JSON.parse(raw) as Record<string, unknown>;
          }
          return raw as Record<string, unknown>;
        };

        return {
          ...row,
          countryOfBirth: toCountryDto(parseJsonb(row.country_of_birth)),
          departmentOfBirth: toDepartmentDto(
            parseJsonb(row.department_of_birth),
          ),
          cityOfBirth: toCityDto(parseJsonb(row.city_of_birth)),
          countryOfResidence: toCountryDto(
            parseJsonb(row.country_of_residence),
          ),
          departmentOfResidence: toDepartmentDto(
            parseJsonb(row.department_of_residence),
          ),
          cityOfResidence: toCityDto(parseJsonb(row.city_of_residence)),
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
