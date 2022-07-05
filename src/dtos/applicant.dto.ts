import { IsEmail, Length } from 'class-validator';
import moment from 'moment';

export class ApplicantDtoSignUp {
  @Length(4, 60)
  public name: string;

  @IsEmail()
  public email: string;

  @Length(6)
  public password: string;
}

export class ApplicantDto {
  constructor({ name, email, creation_date, modification_date, about_me = '', id = -1 }) {
    this.name = name;
    this.about_me = about_me;
    this.email = email;
    this.creation_date = moment(creation_date).format('DD-MM-YYYY');
    this.modification_date = moment(modification_date).format('DD-MM-YYYY');
    this.id = id;
  }

  public name: string;

  public email: string;

  public creation_date: string;

  public modification_date: string;

  public about_me: string;

  public id: number;
}
