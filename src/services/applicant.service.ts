import { ApplicantDtoSignUp } from '@/dtos/applicant.dto';
import { EApplicant } from '@/enums/applicant.enum';
import { Applicant } from '@/models/applicant.model';
import { ApplicantRepository } from '@/repositories/applicant.repository';
import { HttpError } from 'routing-controllers';
import { Repository } from 'typeorm';

export class ApplicantService {
  private applicantRepo: Repository<Applicant>;
  constructor() {
    this.applicantRepo = ApplicantRepository;
  }

  async signUp(applicant: ApplicantDtoSignUp) {
    const now = new Date();
    try {
      return await this.applicantRepo.save({
        ...applicant,
        creation_date: now,
        modification_date: now,
      });
    } catch (e) {
      console.error(e);
      throw new HttpError(500, EApplicant.ERROR_CREATE_APPLICANT);
    }
  }
}
