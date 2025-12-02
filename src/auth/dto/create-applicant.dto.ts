import { IsEmail, IsString, Length,  } from "class-validator";
import { Transform } from "class-transformer";

export class CreateApplicantDto {
  @Length(1, 60)
  @Transform(({ value }) => value.trim())
  @IsString()
  public firstName: string;

  @Length(0, 60)
  @Transform(({ value }) => value.trim())
  @IsString()
  public lastName: string;

  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  public email: string;

  @Length(6, 30)
  public password: string;
}