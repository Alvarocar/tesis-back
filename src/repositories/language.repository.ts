import { AppDataSource } from '@/data-source';
import { Language } from '@/models/language.model';

export const ApplicantRepository = AppDataSource.getRepository(Language);
