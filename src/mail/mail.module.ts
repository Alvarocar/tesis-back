import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';

/**
 * Resuelve el directorio de templates Handlebars en el orden:
 *   1) junto al módulo compilado (`dist/src/mail/templates`)
 *   2) bajo `src/mail/templates` (correr con ts-node / nest start --watch)
 *   3) bajo `dist/mail/templates` (build puro)
 * Esto evita el bug `ENOENT` cuando el entrypoint vive en `dist/src/...`
 * pero los assets los copia `nest-cli` a `dist/...`.
 */
function resolveTemplatesDir(): string {
  const candidates = [
    join(__dirname, 'templates'),
    resolve(process.cwd(), 'src', 'mail', 'templates'),
    resolve(process.cwd(), 'dist', 'mail', 'templates'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  // Si ninguno existe, devolvemos el primero: el adapter reportará el error
  // con la ruta que esperábamos, lo que ayuda a depurar.
  return candidates[0];
}

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST', 'localhost'),
          port: parseInt(configService.get<string>('MAIL_PORT', '1025'), 10),
          auth: configService.get<string>('MAIL_USER')
            ? {
                user: configService.get<string>('MAIL_USER'),
                pass: configService.get<string>('MAIL_PASSWORD'),
              }
            : undefined,
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM', ''),
        },
        template: {
          dir: resolveTemplatesDir(),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    ConfigModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
