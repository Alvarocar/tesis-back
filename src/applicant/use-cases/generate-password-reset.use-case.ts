import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { Role } from 'src/shared/enums/role.enum';
import { FRONTEND_URL } from 'src/shared/constants/env.constant';
import { SecurityService } from 'src/shared/security/security.service';
import { MailService } from 'src/mail/mail.service';
import {
  APPLICANT_REPOSITORY,
  type ApplicantRepositoryPort,
} from '../repositories/applicant.repository';

const RESET_LINK_PATH = '/aspirante/restablecer-contrasena';
const RESET_TOKEN_EXPIRATION_HOURS = 1;

export interface GeneratePasswordResetInput {
  email: string;
}

/**
 * Use-case: generar token de reset y enviar email.
 *
 * Pasos:
 * 1. Buscar applicant por email.
 * 2. Generar token JWT con expiración.
 * 3. Persistir token + expiración.
 * 4. Mandar email (best-effort: si falla, el caller igual recibió éxito
 *    porque el token está persistido — el frontend podrá reintentar).
 */
@Injectable()
export class GeneratePasswordResetUseCase {
  constructor(
    @Inject(APPLICANT_REPOSITORY)
    private readonly applicantRepo: ApplicantRepositoryPort,
    private readonly securityService: SecurityService,
    private readonly mailService: MailService,
    private readonly logger: StructuredLogger,
  ) {}

  async execute({ email }: GeneratePasswordResetInput): Promise<void> {
    return this.logger.timed(
      'applicant.passwordReset.generate',
      async () => {
        const applicant = await this.applicantRepo.findByEmail(email);
        if (!applicant) throw new NotFoundError('Applicant', email);

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRATION_HOURS);

        const token = await this.securityService.generateToken({
          id: applicant.id,
          firstName: applicant.firstName,
          lastName: applicant.lastName ?? '',
          email: applicant.email,
          role: Role.Applicant,
          exp: Math.floor(expiresAt.getTime() / 1000),
        });

        await this.applicantRepo.setPasswordResetToken(
          applicant.id,
          token,
          expiresAt,
        );

        const resetLink = `${FRONTEND_URL}${RESET_LINK_PATH}?token=${token}`;

        try {
          await this.mailService.sendEmail({
            to: applicant.email,
            subject: 'Instrucciones para restablecer tu contraseña',
            key: 'reset-password.applicant',
            context: {
              name: `${applicant.firstName} ${applicant.lastName ?? ''}`.trim(),
              url: resetLink,
            },
          });
        } catch (error) {
          this.logger.warn('applicant.passwordReset.emailFailed', {
            email: applicant.email,
            error: (error as Error).message,
          });
        }
      },
      { email },
    );
  }
}
