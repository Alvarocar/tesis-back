import { IsEmail } from 'class-validator';

export class ResendInvitationDto {
  @IsEmail({}, { message: 'Debe proporcionar un correo válido' })
  email: string;
}
