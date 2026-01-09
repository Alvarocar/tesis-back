import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
  })
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value);
    if (isNaN(parsed)) return 10;
    if (parsed < 10) return 10;
    if (parsed > 20) return 20;
    return parsed;
  })
  pageSize: number = 10;
}
