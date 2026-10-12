import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  @Matches(/^[0-9-]+$/, {
    message: 'El NIT solo puede contener números y guiones',
  })
  nit: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
