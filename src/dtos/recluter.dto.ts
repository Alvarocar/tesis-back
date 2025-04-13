import { Recruiter } from '@/models/recluter.model';
import { IsEmail, IsString, Length } from 'class-validator';
import moment from 'moment';

export class RecruiterDtoLogIn {
  @IsEmail()
  public email: string;

  @Length(6)
  public password: string;
}

export class RecruiterDtoSignUp {
  @Length(4, 60)
  public name: string;

  @IsEmail()
  public email: string;

  @Length(6)
  public password: string;
}

export class RecruiterDto {
  constructor({ firstName, lastName, email, creationDate, modificationDate, id = -1 }: Recruiter) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.creationDate = moment(creationDate).format('DD-MM-YYYY');
    this.modificationDate = moment(modificationDate).format('DD-MM-YYYY');
    this.id = id;
  }

  public firstName: string;

  public lastName: string;

  public email: string;

  public creationDate: string;

  public modificationDate: string;

  public id: number;

  public rol: string;
}

export class RecruiterDtoUpdate {
  @IsString()
  @Length(4, 60)
  firstName: string;

  @IsString()
  @Length(4, 60)
  lastName: string;
}
