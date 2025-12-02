import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

export class JobFilterDto extends PaginationDto {
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    q?: string;
}
