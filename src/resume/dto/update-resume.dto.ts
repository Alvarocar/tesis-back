import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsNumber } from 'class-validator';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
  @IsNumber()
  id: number;
}
