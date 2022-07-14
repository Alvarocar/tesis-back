import { IsEmail, Length } from 'class-validator';
import moment from 'moment';

export class RecluterDtoLogIn {
  @IsEmail()
  public email: string;

  @Length(6)
  public password: string;
}

export class RecluterDtoSignUp {
  @Length(4, 60)
  public name: string;

  @Length(4, 60)
  public rol: string;

  @IsEmail()
  public email: string;

  @Length(6)
  public password: string;
}

export class RecluterDto {
  constructor({ name, email, creation_date, modification_date, about_me = '', id = -1, rol }) {
    this.name = name;
    this.about_me = about_me;
    this.email = email;
    this.creation_date = moment(creation_date).format('DD-MM-YYYY');
    this.modification_date = moment(modification_date).format('DD-MM-YYYY');
    this.id = id;
    this.rol = rol;
  }

  public name: string;

  public email: string;

  public creation_date: string;

  public modification_date: string;

  public about_me: string;

  public id: number;

  public rol: string;
}
