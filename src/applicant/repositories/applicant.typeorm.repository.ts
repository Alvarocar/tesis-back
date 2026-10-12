import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Applicant } from '../entities/applicant.entity';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import {
  APPLICANT_REPOSITORY,
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
          ])
          .where('applicant.id = :id', { id })
          .getOne();
        if (!row) return null;
        return row as unknown as ApplicantOverview;
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
