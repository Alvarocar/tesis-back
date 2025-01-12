import { AppDataSource } from '@/data-source';
import { Recruiter } from '@/models/recluter.model';

export const RecruiterRepository = AppDataSource.getRepository(Recruiter);
