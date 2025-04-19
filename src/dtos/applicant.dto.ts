import { Applicant } from '@/models/applicant.model';
import { dateToString } from '@/utils/date.util';
import { IsEmail, IsNumber, IsNumberString, IsOptional, IsString, Length } from 'class-validator';
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
  constructor({ firstName, lastName, email, creationDate, modificationDate, phoneNumber, birthDate, direction, identification, id }: Applicant) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.creationDate = dateToString(creationDate);
    this.modificationDate = dateToString(modificationDate);
    this.id = id;
    this.phoneNumber = phoneNumber;
    this.birthDate = dateToString(birthDate);
    this.direction = direction;
    this.identification = String(identification);
  }

  public firstName: string;

  public lastName: string;

  public email: string;

  public creationDate: string;

  public modificationDate: string;

  public id: number;

  public phoneNumber: string;

  public birthDate: string;

  public direction: string;

  public identification: string;
}

export class ApplicantPersonalInfoDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsNumberString()
  identification: string;

  @IsOptional()
  phoneNumber: string | null;

  /**
   * @format DD-MM-YYYY
   */
  @IsOptional()
  birthDate: string | null;

  @IsOptional()
  direction: string | null;
}
