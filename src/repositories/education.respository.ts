import { AppDataSource } from '@/data-source';
import { Education } from '@/models/education.model';

export const ApplicantRepository = AppDataSource.getRepository(Education);
