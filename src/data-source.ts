import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Applicant } from '@models/applicant.model';
import { Recluter } from './models/recluter.model';
import { ENV } from './constants';

export const AppDataSource = new DataSource({
  type: ENV.POSTGRESS.type,
  host: ENV.POSTGRESS.host,
  port: Number(ENV.POSTGRESS.port),
  username: ENV.POSTGRESS.username,
  password: ENV.POSTGRESS.password,
  database: ENV.POSTGRESS.database,
  synchronize: true,
  logging: ENV.POSTGRESS.logging,
  entities: [Applicant, Recluter],
});
