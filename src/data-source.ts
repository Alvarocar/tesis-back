import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Applicant } from '@models/applicant.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'tesis',
  entities: [Applicant],
  synchronize: true,
  logging: false,
});
