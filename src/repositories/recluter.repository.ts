import { AppDataSource } from '@/data-source';
import { Recluter } from '@/models/recluter.model';

export const RecluterRepository = AppDataSource.getRepository(Recluter);
