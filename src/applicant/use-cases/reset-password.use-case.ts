import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ValidationError } from 'src/shared/errors/domain.error';
import { withTransaction } from 'src/shared/utils/transaction.util';
import type { Applicant } from '../entities/applicant.entity';
import {
  APPLICANT_REPOSITORY,
  type ApplicantRepositoryPort,
} from '../repositories/applicant.repository';
import {
  ResetPasswordChainBuilder,
  type ResetPasswordContext,
} from '../chains/reset-password.chain';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

/**
 * Use-case: resetear password con token de invitación.
 *
 * Flujo:
 * 1. Construir contexto.
 * 2. Ejecutar `ResetPasswordChain` (strength → resolve → hash).
 * 3. En una transacción:
 *    - update `password = hashed`.
 *    - limpiar `invitationToken` + `invitationTokenExpires`.
 */
@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(APPLICANT_REPOSITORY)
    private readonly applicantRepo: ApplicantRepositoryPort,
    private readonly chainBuilder: ResetPasswordChainBuilder,
    private readonly logger: StructuredLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    return this.logger.timed(
      'applicant.passwordReset.reset',
      async () => {
        const ctx: ResetPasswordContext = { ...input };
        await this.chainBuilder.build().handle(ctx);

        if (!ctx.applicant || !ctx.hashedPassword) {
          throw new ValidationError(
            'No se completó la operación, comunicar al soporte',
          );
        }

        const applicant: Pick<Applicant, 'id'> = { id: ctx.applicant.id };
        const hashed = ctx.hashedPassword;

        await withTransaction(this.dataSource, async (manager) => {
          // Update password
          await manager
            .createQueryBuilder()
            .update('applicant')
            .set({ password: hashed, modificationDate: new Date() })
            .where('id = :id', { id: applicant.id })
            .execute();
          // Limpiar token
          await manager
            .createQueryBuilder()
            .update('applicant')
            .set({ invitationToken: null, invitationTokenExpires: null })
            .where('id = :id', { id: applicant.id })
            .execute();
        });

        this.logger.info('applicant.passwordReset.completed', {
          applicantId: applicant.id,
        });
      },
      { token: 'redacted' },
    );
  }
}
