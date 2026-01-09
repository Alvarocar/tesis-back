import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST', 'localhost'),
          port: parseInt(configService.get<string>('MAIL_PORT', '1025'), 10),
          ignoreTLS: configService.get<string>('MAIL_IGNORE_TLS', 'true') === 'true',
          secure: configService.get<string>('MAIL_SECURE', 'false') === 'true',
          auth: configService.get<string>('MAIL_USER')
            ? {
                user: configService.get<string>('MAIL_USER'),
                pass: configService.get<string>('MAIL_PASSWORD'),
              }
            : undefined,
        },
        defaults: {
          from: configService.get<string>(
            'MAIL_FROM',
            '"NeuroScreen" <noreply@neuroscreen.com>',
          ),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
