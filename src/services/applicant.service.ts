import { ApplicantDtoSignUp } from '@/dtos/applicant.dto';
import { EApplicant } from '@/enums/applicant.enum';
import { InternalServerException, BadRequestException } from '@/exceptions/HttpException';
import { Applicant } from '@/models/applicant.model';
import { ApplicantRepository } from '@/repositories/applicant.repository';
import { responseWithToken } from '@/utils/response.util';
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
      const doppleganger = await this.applicantRepo.findOne({ where: { email: applicant.email } });
      if (doppleganger != null) throw new BadRequestException(EApplicant.ERROR_DUPLICATE_EMAIL);
      return await this.applicantRepo.save({
        ...applicant,
        creation_date: now,
        modification_date: now,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof HttpError) throw e;
      throw new InternalServerException(EApplicant.ERROR_CREATE_APPLICANT);
    }
  }
}
