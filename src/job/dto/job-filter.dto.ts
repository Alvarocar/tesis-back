import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { VacancyStatus } from 'src/vacancy/enums/vacancy-status.enum';

export class JobFilterDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (value as string)?.trim())
  q?: string;

  status: VacancyStatus = VacancyStatus.ENABLE;
}
