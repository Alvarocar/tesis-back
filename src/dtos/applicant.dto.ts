import { Applicant } from '@/models/applicant.model';
import { IsEmail, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import moment from 'moment';

export class ApplicantDtoLogIn {
  @IsEmail()
  public email: string;

  @Length(6)
  public password: string;
}

export class ApplicantDtoSignUp {
  @Length(0, 60)
  public firstName: string;

  @Length(0, 60)
  public lastName: string;

  @IsEmail()
  public email: string;

  @Length(6)
  public password: string;
}

export class ApplicantDto {
  constructor({ firstName, lastName, email, creation_date, modification_date, phone_number, birth_date, direction, identification, id }: Applicant) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.creation_date = moment(creation_date).format('DD-MM-YYYY');
    this.modification_date = moment(modification_date).format('DD-MM-YYYY');
    this.id = id;
    this.phone_number = phone_number;
    this.birth_date = moment(birth_date).format('DD-MM-YYYY');
    this.direction = direction;
    this.identification = String(identification);
  }

  public firstName: string;

  public lastName: string;

  public email: string;

  public creation_date: string;

  public modification_date: string;

  public id: number;

  public phone_number: string;

  public birth_date: string;

  public direction: string;

  public identification: string;
}

export class ApplicantPersonalInfoDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumber()
  identification: number;

  @IsOptional()
  phone_number: string | null;

  /**
   * @format DD-MM-YYYY
   */
  @IsOptional()
  birth_date: string | null;

  @IsOptional()
  direction: string | null;
}
