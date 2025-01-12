import moment from 'moment';
import { Repository } from 'typeorm';
import { HttpError, NotFoundError } from 'routing-controllers';
import { RecruiterRepository } from '@/repositories/recluter.repository';
import { InternalServerException, BadRequestException } from '@/exceptions/HttpException';
import { RecruiterDto, RecruiterDtoLogIn, RecruiterDtoSignUp } from '@/dtos/recluter.dto';
import { EApplicant } from '@/enums/applicant.enum';
import { Recruiter } from '@/models/recluter.model';
import { GenericService } from './generic.service';

export class RecruiterService extends GenericService {
  private recruiterRepo: Repository<Recruiter>;
  constructor() {
    super();
    this.recruiterRepo = RecruiterRepository;
  }

  async signUp(recruiter: RecruiterDtoSignUp) {
    const now = moment();
    try {
      const doppelganger = await this.recruiterRepo.findOne({ where: { email: recruiter.email } });
      if (doppelganger != null) throw new BadRequestException(EApplicant.ERROR_DUPLICATE_EMAIL);
      const password = await this.encrypt(recruiter.password);
      recruiter = { ...recruiter, password };
      return await this.recruiterRepo.save({
        ...recruiter,
        creation_date: now,
        modification_date: now,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof HttpError) throw e;
      throw new InternalServerException(EApplicant.ERROR_CREATE_APPLICANT);
    }
  }

  async logIn(recruiter: RecruiterDtoLogIn) {
    try {
      const find = await this.recruiterRepo.findOne({ where: { email: recruiter.email } });
      if (!find) throw new NotFoundError(EApplicant.ERROR_NOT_MATCH_ACCOUNT);
      const areEquals = await this.compareHash(recruiter.password, find.password);
      if (!areEquals) throw new NotFoundError(EApplicant.ERROR_NOT_MATCH_ACCOUNT);
      return new RecruiterDto({ ...find });
    } catch (e) {
      this.internalError(e, EApplicant.ERROR_GENERIC);
    }
  }
}
