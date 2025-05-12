import './config';
import { ApplicationListener } from './listeners/application.listener';
import { AppDataSource } from './data-source';

async function start() {
  await AppDataSource.initialize();

  const applicantApplyListener = new ApplicationListener();

  applicantApplyListener.init();
}

start();
