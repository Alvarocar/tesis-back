import { RecluterDto, RecluterDtoLogIn, RecluterDtoSignUp } from '@/dtos/recluter.dto';
import { EApplicant } from '@/enums/applicant.enum';
import { InternalServerException, BadRequestException } from '@/exceptions/HttpException';
import { Recluter } from '@/models/recluter.model';
import { RecluterRepository } from '@/repositories/recluter.repository';
import moment from 'moment';
import { HttpError, NotFoundError } from 'routing-controllers';
import { Repository } from 'typeorm';
import { GenericService } from './generic.service';

export class RecluterService extends GenericService {
  private recluterRepo: Repository<Recluter>;
  constructor() {
    super();
    this.recluterRepo = RecluterRepository;
  }

  async signUp(recluter: RecluterDtoSignUp) {
    const now = moment();
    try {
      const doppleganger = await this.recluterRepo.findOne({ where: { email: recluter.email } });
      if (doppleganger != null) throw new BadRequestException(EApplicant.ERROR_DUPLICATE_EMAIL);
      const password = await this.encrypt(recluter.password);
      recluter = { ...recluter, password };
      return await this.recluterRepo.save({
        ...recluter,
        creation_date: now,
        modification_date: now,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof HttpError) throw e;
      throw new InternalServerException(EApplicant.ERROR_CREATE_APPLICANT);
    }
  }

  async logIn(recluter: RecluterDtoLogIn) {
    try {
      const find = await this.recluterRepo.findOne({ where: { email: recluter.email } });
      if (!find) throw new NotFoundError(EApplicant.ERROR_NOT_MATCH_ACCOUNT);
      const areEquals = await this.compareHash(recluter.password, find.password);
      if (!areEquals) throw new NotFoundError(EApplicant.ERROR_NOT_MATCH_ACCOUNT);
      return new RecluterDto({ ...find });
    } catch (e) {
      this.internalError(e, EApplicant.ERROR_GENERIC);
    }
  }
}
