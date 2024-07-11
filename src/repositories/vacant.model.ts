import { AppDataSource } from '@/data-source';
import { Vacant } from '@/models/vacant.model';

export const ApplicantRepository = AppDataSource.getRepository(Vacant);
