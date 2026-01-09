import { IsEmail, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateApplicantDto {
  @Length(1, 60)
  @Transform(({ value }) => (value as string).trim())
  @IsString()
  public firstName: string;

  @Length(0, 60)
  @Transform(({ value }) => (value as string).trim())
  @IsString()
  public lastName: string;

  @Transform(({ value }) => (value as string).trim().toLowerCase())
  @IsEmail()
  public email: string;

  @Length(6, 30)
  public password: string;
}
