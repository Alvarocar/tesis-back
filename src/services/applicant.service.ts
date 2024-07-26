import { ApplicantDto, ApplicantDtoLogIn, ApplicantDtoSignUp } from '@/dtos/applicant.dto';
import { EApplicant } from '@/enums/applicant.enum';
import { InternalServerException, BadRequestException } from '@/exceptions/HttpException';
import { Applicant } from '@/models/applicant.model';
import { ApplicantRepository } from '@/repositories/applicant.repository';
import { HttpError, NotFoundError } from 'routing-controllers';
import { Repository } from 'typeorm';
import { GenericService } from './generic.service';

export class ApplicantService extends GenericService {
  constructor() {
    super();
  }

  async signUp(applicant: ApplicantDtoSignUp) {
    const now = new Date();
    try {
      const doppleganger = await ApplicantRepository.findOne({ where: { email: applicant.email } });
      if (doppleganger != null) throw new BadRequestException(EApplicant.ERROR_DUPLICATE_EMAIL);
      const applicantEntity = ApplicantRepository.createSignup(applicant);
      await ApplicantRepository.insert({
        ...applicant,
        creation_date: now,
        modification_date: now,
      });

      return applicantEntity;
    } catch (e) {
      console.error(e);
      if (e instanceof HttpError) throw e;
      throw new InternalServerException(EApplicant.ERROR_CREATE_APPLICANT);
    }
  }

  async logIn(applicant: ApplicantDtoLogIn) {
    try {
      const find = await ApplicantRepository.findOne({ where: { email: applicant.email } });
      if (!find) throw new NotFoundError(EApplicant.ERROR_NOT_MATCH_ACCOUNT);
      const areEquals = await this.compareHash(applicant.password, find.password);
      if (!areEquals) throw new NotFoundError(EApplicant.ERROR_NOT_MATCH_ACCOUNT);
      return new ApplicantDto({ ...find });
    } catch (e) {
      this.internalError(e, EApplicant.ERROR_GENERIC);
    }
  }

  async getProfile(applicant: Applicant) {
    return applicant;
  }
}
