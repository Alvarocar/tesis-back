import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FRONTEND_URL } from './shared/constants/env.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: FRONTEND_URL,
  });
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
