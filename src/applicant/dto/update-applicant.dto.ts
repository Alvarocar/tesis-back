import { IsString, IsNotEmpty, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsDateFormat } from 'src/shared/decorators/is-date-format.decorator';

export class UpdateApplicantDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  @Transform(({ value }) => (value as string)?.trim())
  firstName: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres' })
  @Transform(({ value }) => (value as string)?.trim())
  lastName: string;

  @IsString({ message: 'La identificación debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La identificación no puede estar vacía' })
  @Length(6, 20, {
    message: 'La identificación debe tener entre 6 y 20 caracteres',
  })
  @Transform(({ value }) => (value as string)?.trim().toUpperCase())
  identification: string;

  @IsString({ message: 'El número de teléfono debe ser una cadena de texto' })
  /* @IsPhoneNumber('CO', { 
    message: 'El número de teléfono debe tener un formato válido para Colombia' 
  }) */
  @Transform(({ value }) => (value as string)?.trim())
  phoneNumber: string;
  /**
   * @format DD-MM-YYYY
   */
  @IsString({ message: 'La fecha de nacimiento debe ser una cadena de texto' })
  @IsDateFormat('DD-MM-YYYY', {
    message: 'La fecha de nacimiento debe tener el formato DD-MM-YYYY',
  })
  @Transform(({ value }) => (value as string)?.trim())
  birthDate: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @Length(5, 60, { message: 'La dirección debe tener entre 5 y 60 caracteres' })
  @Transform(({ value }) => (value as string)?.trim())
  direction: string;
}
