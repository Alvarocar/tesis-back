import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { ConflictError } from 'src/shared/errors/domain.error';
import { MailService } from 'src/mail/mail.service';
import { SecurityService } from 'src/shared/security/security.service';
import { FRONTEND_URL } from 'src/shared/constants/env.constant';
import type { CreateApplicantDto } from 'src/auth/dto/create-applicant.dto';
import type { Applicant } from '../entities/applicant.entity';
import {
  APPLICANT_REPOSITORY,
  type ApplicantRepositoryPort,
} from '../repositories/applicant.repository';

/**
 * Use-case: crear un applicant (registro público + bienvenida por mail).
 * - Verifica que el email no exista.
 * - Hashea password.
 * - Persiste vía port.
 * - Envía email de bienvenida (best-effort: si falla el mail, el applicant
 *   queda creado; la advertencia se loguea).
 */
@Injectable()
export class CreateApplicantUseCase {
  constructor(
    @Inject(APPLICANT_REPOSITORY)
    private readonly applicantRepo: ApplicantRepositoryPort,
    private readonly securityService: SecurityService,
    private readonly mailService: MailService,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(input: CreateApplicantDto): Promise<Applicant> {
    return this.logger.timed(
      'applicant.create',
      async () => {
        const existing = await this.applicantRepo.findByEmail(input.email);
        if (existing) {
          throw new ConflictError('Esta dirección de correo ya está en uso', {
            email: input.email,
          });
        }

        const hashedPassword = await this.securityService.generateHash(
          input.password,
        );

        const applicant = await this.applicantRepo.insert({
          ...input,
          password: hashedPassword,
          creationDate: new Date(),
        });

        // Best-effort email: no rompe el flujo si falla.
        try {
          await this.mailService.sendEmail({
            to: applicant.email,
            subject: '¡Bienvenido a NextStep!',
            key: 'welcome.applicant',
            context: {
              name: `${applicant.firstName} ${applicant.lastName ?? ''}`.trim(),
              url: FRONTEND_URL ?? '',
            },
          });
        } catch (error) {
          this.logger.warn('applicant.welcomeEmail.failed', {
            email: applicant.email,
            error: (error as Error).message,
          });
        }

        return applicant;
      },
      { email: input.email },
    );
  }
}
