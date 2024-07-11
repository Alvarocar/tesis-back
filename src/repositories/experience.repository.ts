import { AppDataSource } from '@/data-source';
import { Experience } from '@/models/experience.model';

export const ApplicantRepository = AppDataSource.getRepository(Experience);
