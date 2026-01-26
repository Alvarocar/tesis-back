import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface EmailStrategy {
  'welcome.employee': {
    /**
     * Name of the employee
     */
    name: string;
    /**
     * Number of hours the invitation is valid
     */
    expirationHours: string;
    /**
     * URL to configure the password
     */
    invitationUrl: string;
  };

  'welcome.applicant': {
    /**
     * Name of the applicant
     */
    name: string;
    /**
     * URL to reset the password
     */
    url: string;
  };

  'reset-password.applicant': {
    /**
     * Name of the applicant
     */
    name: string;
    /**
     * URL to reset the password
     */
    url: string;
  };
}

@Injectable()
export class MailService {
  private readonly MAIL_FROM: string;

  constructor(
    private readonly mailerService: MailerService,
    readonly configService: ConfigService,
  ) {
    this.MAIL_FROM = configService.get<string>('MAIL_FROM', '');
  }

  private readonly logger = new Logger(MailService.name);

  async sendEmail<K extends keyof EmailStrategy>(payload: {
    key: K;
    to: string;
    from?: string;
    subject: string;
    context: EmailStrategy[K];
  }) {
    try {
      await this.mailerService.sendMail({
        to: payload.to,
        template: `${payload.key}.handlebars`,
        subject: payload.subject,
        from: payload.from ?? this.MAIL_FROM,
        context: payload.context,
      });
    } catch (error) {
      this.logger.error(
        `Error sending email to ${payload.to} with template ${payload.key}: ${
          (error as Error).message
        }`,
      );
    }
  }
}
