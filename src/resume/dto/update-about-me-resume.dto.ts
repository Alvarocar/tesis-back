import { IsNumber, IsString } from 'class-validator';

export class UpdateAboutMeDto {
  @IsNumber()
  resumeId: number;
  @IsString()
  aboutMe: string;
}
