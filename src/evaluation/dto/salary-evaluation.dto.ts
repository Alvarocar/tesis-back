import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class SalaryEvaluationDto {
  @IsNumber()
  min: number;

  @IsNumber()
  @IsOptional()
  max?: number;

  @IsEnum(['monthly', 'annual'])
  salaryPeriod: 'monthly' | 'annual';

  @IsEnum([
    'USD',
    'EUR',
    'PEN',
    'GBP',
    'JPY',
    'CNY',
    'INR',
    'AUD',
    'CAD',
    'CHF',
    'MXN',
    'BRL',
    'ARS',
  ])
  salaryCurrency: string;
}
