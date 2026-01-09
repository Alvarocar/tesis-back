import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignInDto {
  @Transform(({ value }) => (value as string)?.toLowerCase().trim())
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}
