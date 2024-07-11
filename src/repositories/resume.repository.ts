import { AppDataSource } from '@/data-source';
import { Resume } from '@/models/resume.model';

export const ResumeRepository = AppDataSource.getRepository(Resume);
