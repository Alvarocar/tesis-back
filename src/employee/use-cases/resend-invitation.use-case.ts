import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { MailService } from 'src/mail/mail.service';
import { FRONTEND_URL } from 'src/shared/constants/env.constant';
import { randomBytes } from 'crypto';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';

const INVITATION_PATH = '/empleados/restablecer-contrasena';

@Injectable()
export class ResendInvitationUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    private readonly mailService: MailService,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(email: string): Promise<void> {
    return this.logger.timed(
      'employee.resendInvitation',
      async () => {
        const employee = await this.employeeRepo.findByEmail(email);
        if (!employee) throw new NotFoundError('Employee', email);

        const token = randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);

        await this.employeeRepo.setInvitationToken(employee.id, token, expires);

        try {
          await this.mailService.sendEmail({
            key: 'welcome.employee',
            to: employee.email,
            subject: 'Reenvío de invitación - Configura tu cuenta',
            context: {
              name: `${employee.firstName} ${employee.lastName ?? ''}`.trim(),
              expirationHours: '24',
              invitationUrl: `${FRONTEND_URL ?? ''}${INVITATION_PATH}?token=${token}`,
            },
          });
        } catch (error) {
          this.logger.warn('employee.resendInvitation.emailFailed', {
            email,
            error: (error as Error).message,
          });
        }
      },
      { email },
    );
  }
}
