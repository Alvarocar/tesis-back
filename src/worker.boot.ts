// src/index.ts
import { RabbitMQService } from './utils/rabbit.util';
import { ApplicationListener } from './listeners/application.listener';

const RABBITMQ_URL = 'amqp://tesis:tesis@localhost:5672/';

async function start() {
  const rabbitMQService = new RabbitMQService(RABBITMQ_URL);
  await rabbitMQService.connect();

  const applicantApplyListener = new ApplicationListener();
  await rabbitMQService.registerListener(applicantApplyListener);
}

start();
