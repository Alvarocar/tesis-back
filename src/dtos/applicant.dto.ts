import { Applicant } from '@/models/applicant.model';
import { IsEmail, Length } from 'class-validator';
import moment from 'moment';

export class ApplicantDtoLogIn {
  @IsEmail()
  public email: string;

  @Length(6)
  public password: string;
}

export class ApplicantDtoSignUp {
  @Length(4, 60)
  public name: string;

  @IsEmail()
  public email: string;

  @Length(6)
  public password: string;
}

export class ApplicantDto {
  constructor({ name, email, creation_date, modification_date, phone_number, birth_date, direction, identification, id }: Applicant) {
    this.name = name;
    this.email = email;
    this.creation_date = moment(creation_date).format('DD-MM-YYYY');
    this.modification_date = moment(modification_date).format('DD-MM-YYYY');
    this.id = id;
    this.phone_number = phone_number;
    this.birth_date = moment(birth_date).format('DD-MM-YYYY');
    this.direction = direction;
    this.identification = String(identification);
  }

  public name: string;

  public email: string;

  public creation_date: string;

  public modification_date: string;

  public id: number;

  public phone_number: string;

  public birth_date: string;

  public direction: string;

  public identification: string;
}
