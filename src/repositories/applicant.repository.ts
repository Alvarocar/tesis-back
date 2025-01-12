import { AppDataSource } from '@/data-source';
import { ApplicantDtoSignUp } from '@/dtos/applicant.dto';
import { Applicant } from '@/models/applicant.model';
import { encrypt } from '@/utils/security/token.util';

export const ApplicantRepository = AppDataSource.getRepository(Applicant).extend({
  createSignup: async (data: ApplicantDtoSignUp) => {
    const now = new Date();
    const hash_password = await encrypt(data.password);
    return ApplicantRepository.create({
      creation_date: now,
      modification_date: now,
      email: data.email,
      password: hash_password,
      firstName: data.firstName + ' ' + data.lastName,
    });
  },
});
