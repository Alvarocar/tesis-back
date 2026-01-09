import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      throw new BadRequestException({
        message: 'El ID debe ser un número entero positivo válido',
        error: 'Invalid ID Format',
        statusCode: 400,
        providedValue: value,
      });
    }

    return parsedValue;
  }
}
