import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import { Applicant } from '@/models/applicant.model';
import { Recruiter } from '@/models/recluter.model';

export interface DataStoredInToken {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}
export interface RequestWithApplicant extends Request {
  user: Applicant;
}
export interface RequestWithRecluter extends Request {
  user: Recruiter;
}
