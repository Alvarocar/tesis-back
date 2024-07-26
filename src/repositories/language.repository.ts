import { AppDataSource } from '@/data-source';
import { Language } from '@/models/language.model';

export const LanguageRepository = AppDataSource.getRepository(Language);
