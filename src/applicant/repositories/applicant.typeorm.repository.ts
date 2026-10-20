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
            (sub) =>
              sub
                .select('c.id', 'id')
                .addSelect('c.name', 'name')
                .addSelect('c.code', 'code')
                .from('country', 'c')
                .where('c.id = applicant.country_of_birth_id'),
            'country_of_birth',
          )
          .addSelect(
            (sub) =>
              sub
                .select('d.id', 'id')
                .addSelect('d.name', 'name')
                .addSelect('d.code', 'code')
                .addSelect('d.country_id', 'countryId')
                .from('department', 'd')
                .where('d.id = applicant.department_of_birth_id'),
            'department_of_birth',
          )
          .addSelect(
            (sub) =>
              sub
                .select('ct.id', 'id')
                .addSelect('ct.name', 'name')
                .addSelect('ct.type', 'type')
                .addSelect('ct.country_id', 'countryId')
                .addSelect('ct.department_id', 'departmentId')
                .from('city', 'ct')
                .where('ct.id = applicant.city_of_birth_id'),
            'city_of_birth',
          )
          .addSelect(
            (sub) =>
              sub
                .select('c.id', 'id')
                .addSelect('c.name', 'name')
                .addSelect('c.code', 'code')
                .from('country', 'c')
                .where('c.id = applicant.country_of_residence_id'),
            'country_of_residence',
          )
          .addSelect(
            (sub) =>
              sub
                .select('d.id', 'id')
                .addSelect('d.name', 'name')
                .addSelect('d.code', 'code')
                .addSelect('d.country_id', 'countryId')
                .from('department', 'd')
                .where('d.id = applicant.department_of_residence_id'),
            'department_of_residence',
          )
          .addSelect(
            (sub) =>
              sub
                .select('ct.id', 'id')
                .addSelect('ct.name', 'name')
                .addSelect('ct.type', 'type')
                .addSelect('ct.country_id', 'countryId')
                .addSelect('ct.department_id', 'departmentId')
                .from('city', 'ct')
                .where('ct.id = applicant.city_of_residence_id'),
            'city_of_residence',
          )
          .where('applicant.id = :id', { id })
          .getRawOne();
        if (!row) return null;

        const toOptionOrNull = (
          raw: Record<string, unknown> | null | undefined,
        ): ApplicantOverview['countryOfBirth'] => {
          if (!raw) return null;
          const id = raw.id as number | null | undefined;
          if (id == null) return null;
          return raw as unknown as ApplicantOverview['countryOfBirth'];
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
