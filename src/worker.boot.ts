import './config';
import { RabbitMQService } from './utils/rabbit.util';
import { ApplicationListener } from './listeners/application.listener';
import { AppDataSource } from './data-source';

async function start() {
  console.log(process.env.RELATIONAL_DB_TYPE);
  await AppDataSource.initialize();
  const rabbitMQService = new RabbitMQService();
  await rabbitMQService.connect();

  const applicantApplyListener = new ApplicationListener();
  rabbitMQService.registerListener(applicantApplyListener);

  await rabbitMQService.execute();
}

start();
