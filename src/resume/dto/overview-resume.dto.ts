import { IsInt, IsString } from 'class-validator';

export class OverviewResumeDto {
  @IsInt()
  id: number;

  @IsString()
  title: string;

  @IsString()
  aboutMe: string;
}
