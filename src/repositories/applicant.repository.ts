import { AppDataSource } from '@/data-source';
import { Applicant } from '@/models/applicant.model';

export const ApplicantRepository = AppDataSource.getRepository(Applicant);
