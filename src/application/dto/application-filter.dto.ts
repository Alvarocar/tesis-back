import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

export class ApplicationFilterDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (value as string)?.trim())
  q?: string;
}
