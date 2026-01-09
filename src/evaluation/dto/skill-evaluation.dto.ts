import { IsString } from 'class-validator';

export class SkillEvaluationDTO {
  id: number;
  @IsString()
  name: string;
}
