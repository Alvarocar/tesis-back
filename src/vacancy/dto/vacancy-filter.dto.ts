import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

import { IsEnum } from 'class-validator';
import { VacancyStatus } from '../enums/vacancy-status.enum';

export class VacancyFilterDto extends PaginationDto {
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  @Transform(({ value }) => value?.trim())
  q?: string;

  @IsOptional()
  @IsEnum(VacancyStatus, {
    message: 'El estado proporcionado no es válido',
  })
  statusFilter?: VacancyStatus;
}
