import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignInDto {
    @Transform(({ value }) => value?.toLowerCase().trim())
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    password: string;
}