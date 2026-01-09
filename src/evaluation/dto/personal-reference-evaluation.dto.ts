import { IsNotEmpty, IsString } from 'class-validator';

export class PersonalReferenceEvaluationDto {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
