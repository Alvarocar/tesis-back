import { IsString, MaxLength } from 'class-validator';

export class CreateResumeDto {
  @IsString()
  @MaxLength(60)
  title: string;
}
