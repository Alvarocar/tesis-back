import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { MailService } from 'src/mail/mail.service';
import { FRONTEND_URL } from 'src/shared/constants/env.constant';
import type { CreateEmployeeDto } from '../dto/create-employee.dto';
import {
  CreateEmployeeChainBuilder,
  type CreateEmployeeContext,
} from '../chains/create-employee.chain';
import {
  EMPLOYEE_REPOSITORY,
  type EmployeeRepositoryPort,
} from '../repositories/employee.repository';

const INVITATION_PATH = '/empleados/restablecer-contrasena';
const INVITATION_EXPIRATION_HOURS_LABEL = '24';

/**
 * Use-case: crear un empleado (envía invitación).
 *
 * Flujo:
 * 1. Chain (`EnsureUniqueEmail → EnsureCompanyExists → GenerateToken`).
 * 2. Persistir vía port.
 * 3. Mandar email de invitación (best-effort: si falla, el employee queda
 *    creado y se loguea warning).
 */
@Injectable()
export class CreateEmployeeUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepo: EmployeeRepositoryPort,
    private readonly chainBuilder: CreateEmployeeChainBuilder,
    private readonly mailService: MailService,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(input: CreateEmployeeDto, companyId: number): Promise<void> {
    return this.logger.timed(
      'employee.create',
      async () => {
        const ctx: CreateEmployeeContext = {
          email: input.email,
          companyId,
        };
        await this.chainBuilder.build().handle(ctx);

        await this.employeeRepo.insert({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          companyId,
          invitationToken: ctx.invitationToken!,
          invitationTokenExpires: ctx.invitationTokenExpires!,
        });

        const invitationUrl = `${FRONTEND_URL ?? ''}${INVITATION_PATH}?token=${ctx.invitationToken}`;

        try {
          await this.mailService.sendEmail({
            key: 'welcome.employee',
            to: input.email,
            subject: '¡Bienvenido a NextStep! Configura tu cuenta',
            context: {
              name: `${input.firstName} ${input.lastName}`,
              expirationHours: INVITATION_EXPIRATION_HOURS_LABEL,
              invitationUrl,
            },
          });
        } catch (error) {
          this.logger.warn('employee.invitationEmail.failed', {
            email: input.email,
            error: (error as Error).message,
          });
        }
      },
      { email: input.email, companyId },
    );
  }
}
