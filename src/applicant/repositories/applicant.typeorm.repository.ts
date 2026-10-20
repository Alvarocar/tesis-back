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
          .addSelect(
            `(SELECT JSON_OBJECT('id', c.id, 'name', c.name, 'code', c.code)
                FROM country c
                WHERE c.id = applicant.country_of_birth_id
                LIMIT 1)`,
            'country_of_birth',
          )
          .addSelect(
            `(SELECT JSON_OBJECT('id', d.id, 'name', d.name, 'code', d.code, 'countryId', d.country_id)
                FROM department d
                WHERE d.id = applicant.department_of_birth_id
                LIMIT 1)`,
            'department_of_birth',
          )
          .addSelect(
            `(SELECT JSON_OBJECT('id', ct.id, 'name', ct.name, 'type', ct.type, 'countryId', ct.country_id, 'departmentId', ct.department_id)
                FROM city ct
                WHERE ct.id = applicant.city_of_birth_id
                LIMIT 1)`,
            'city_of_birth',
          )
          .addSelect(
            `(SELECT JSON_OBJECT('id', c.id, 'name', c.name, 'code', c.code)
                FROM country c
                WHERE c.id = applicant.country_of_residence_id
                LIMIT 1)`,
            'country_of_residence',
          )
          .addSelect(
            `(SELECT JSON_OBJECT('id', d.id, 'name', d.name, 'code', d.code, 'countryId', d.country_id)
                FROM department d
                WHERE d.id = applicant.department_of_residence_id
                LIMIT 1)`,
            'department_of_residence',
          )
          .addSelect(
            `(SELECT JSON_OBJECT('id', ct.id, 'name', ct.name, 'type', ct.type, 'countryId', ct.country_id, 'departmentId', ct.department_id)
                FROM city ct
                WHERE ct.id = applicant.city_of_residence_id
                LIMIT 1)`,
            'city_of_residence',
          )
          .where('applicant.id = :id', { id })
          .getRawOne();
        if (!row) return null;

        const toOptionOrNull = (
          raw: unknown,
        ): ApplicantOverview['countryOfBirth'] => {
          if (raw == null) return null;
          // Postgres JSON_OBJECT comes back as a stringified JSON; pg driver
          // may also hand it back as an already-parsed object depending on
          // type parsers, so accept both shapes.
          const obj =
            typeof raw === 'string'
              ? (JSON.parse(raw) as Record<string, unknown>)
              : (raw as Record<string, unknown>);
          const id = obj.id as number | null | undefined;
          if (id == null) return null;
          return obj as unknown as ApplicantOverview['countryOfBirth'];
        };

        return {
          ...row,
          countryOfBirth: toOptionOrNull(row.country_of_birth),
          departmentOfBirth: toOptionOrNull(row.department_of_birth),
          cityOfBirth: toOptionOrNull(row.city_of_birth),
          countryOfResidence: toOptionOrNull(row.country_of_residence),
          departmentOfResidence: toOptionOrNull(row.department_of_residence),
          cityOfResidence: toOptionOrNull(row.city_of_residence),
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
