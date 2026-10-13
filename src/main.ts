import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FRONTEND_URL } from './shared/constants/env.constant';
import { DomainErrorFilter } from './shared/errors/domain-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: FRONTEND_URL,
  });
  app.useGlobalFilters(new DomainErrorFilter());
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
