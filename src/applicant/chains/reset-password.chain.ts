import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ValidationError } from 'src/shared/errors/domain.error';
import { BaseChainHandler } from 'src/shared/chains/base-chain.handler';
import { SecurityService } from 'src/shared/security/security.service';
import {
  APPLICANT_REPOSITORY,
  type ApplicantRepositoryPort,
} from '../repositories/applicant.repository';
import type { Applicant } from '../entities/applicant.entity';

/**
 * Contexto de la cadena de reset password.
 */
export interface ResetPasswordContext {
  readonly token: string;
  readonly newPassword: string;
  applicant?: Applicant;
  hashedPassword?: string;
}

/**
 * Handler: valida que el password cumpla el mínimo (regla de negocio).
 * Hoy: longitud mínima 8 (la validación a fondo la hace el DTO, acá
 * podríamos sumar reglas de complejidad).
 */
@Injectable()
export class ValidatePasswordStrengthHandler extends BaseChainHandler<ResetPasswordContext> {
  protected process(ctx: ResetPasswordContext): Promise<void> {
    if (ctx.newPassword.length < 8) {
      throw new ValidationError(
        'La contraseña debe tener al menos 8 caracteres',
        {
          length: ctx.newPassword.length,
        },
      );
    }
    return Promise.resolve();
  }
}

/**
 * Handler: busca al applicant por token (válido y no expirado).
 * Deja el resultado en `ctx.applicant`.
 */
@Injectable()
export class ResolveApplicantByTokenHandler extends BaseChainHandler<ResetPasswordContext> {
  constructor(
    @Inject(APPLICANT_REPOSITORY)
    private readonly applicantRepo: ApplicantRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {
    super();
  }

  protected async process(ctx: ResetPasswordContext): Promise<void> {
    const applicant = await this.applicantRepo.findByInvitationToken(ctx.token);
    if (!applicant) {
      throw new ValidationError('El token es inválido o ha expirado');
    }
    ctx.applicant = applicant;
    this.logger.debug('applicant.resetPassword.tokenResolved', {
      applicantId: applicant.id,
    });
  }
}

/**
 * Handler: hashea el password para no guardar texto plano.
 */
@Injectable()
export class HashNewPasswordHandler extends BaseChainHandler<ResetPasswordContext> {
  constructor(private readonly securityService: SecurityService) {
    super();
  }

  protected async process(ctx: ResetPasswordContext): Promise<void> {
    ctx.hashedPassword = await this.securityService.generateHash(
      ctx.newPassword,
    );
  }
}

/**
 * Builder de la cadena.
 */
@Injectable()
export class ResetPasswordChainBuilder {
  constructor(
    private readonly strength: ValidatePasswordStrengthHandler,
    private readonly resolve: ResolveApplicantByTokenHandler,
    private readonly hash: HashNewPasswordHandler,
  ) {}

  build() {
    return this.strength.setNext(this.resolve).setNext(this.hash);
  }
}
