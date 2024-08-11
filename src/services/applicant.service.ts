import { ApplicantDto, ApplicantDtoLogIn, ApplicantDtoSignUp, ApplicantPersonalInfoDto } from '@/dtos/applicant.dto';
import { EApplicant } from '@/enums/applicant.enum';
import { InternalServerException, BadRequestException } from '@/exceptions/HttpException';
import { Applicant } from '@/models/applicant.model';
import { ApplicantRepository } from '@/repositories/applicant.repository';
import { HttpError, NotFoundError } from 'routing-controllers';
import { GenericService } from './generic.service';
import { stringToDate } from '@/utils/date.util';

export class ApplicantService extends GenericService {
  constructor() {
    super();
  }

  async signUp(applicant: ApplicantDtoSignUp) {
    try {
      const doppleganger = await ApplicantRepository.findOne({ where: { email: applicant.email } });
      if (doppleganger != null) throw new BadRequestException(EApplicant.ERROR_DUPLICATE_EMAIL);
      const applicantEntity = await ApplicantRepository.createSignup(applicant);
      await ApplicantRepository.insert(applicantEntity);

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

  async updatePersonalInfo(personalInfo: ApplicantPersonalInfoDto, applicant: Applicant) {
    let currentApplicant: null | Applicant = null
    try {
      await ApplicantRepository
      .createQueryBuilder()
      .update()
      .set({
        identification: Number(personalInfo.identification),
        name: personalInfo.name,
        phone_number: personalInfo.phone_number,
        birth_date: personalInfo.birth_date ? stringToDate(personalInfo.birth_date) : null,
        direction: personalInfo.direction,
      })
      .where('id = :id', { id: applicant.id })
      .execute()

      currentApplicant = await ApplicantRepository.createQueryBuilder('apl')
      .select(['apl.id', 'apl.name', 'apl.email', 'apl.modification_date', 'apl.direction', 'apl.identification', 'apl.phone_number', 'birth_date'])
      .where('apl.id = :id', {id: applicant.id})
      .getOneOrFail()

    } catch(e) {
      console.error(e)
      return { message: 'hubo un error' }
    }
    
    return currentApplicant
  }
}
