import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Applicant } from '@models/applicant.model';
import { Recluter } from './models/recluter.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'tesis',
  entities: [Applicant, Recluter],
  synchronize: true,
  logging: false,
});
