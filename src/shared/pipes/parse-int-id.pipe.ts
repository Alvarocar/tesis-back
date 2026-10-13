import { PipeTransform, Injectable } from '@nestjs/common';
import { ValidationError } from 'src/shared/errors/domain.error';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      throw new ValidationError('El ID debe ser un número entero positivo válido', {
        providedValue: value,
      });
    }

    return parsedValue;
  }
}
