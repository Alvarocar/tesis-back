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
  constructor({ name, email, creation_date, modification_date, id = -1 }: Recruiter) {
    this.name = name;
    this.email = email;
    this.creation_date = moment(creation_date).format('DD-MM-YYYY');
    this.modification_date = moment(modification_date).format('DD-MM-YYYY');
    this.id = id;
  }

  public name: string;

  public email: string;

  public creation_date: string;

  public modification_date: string;

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
