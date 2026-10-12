import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from './domain.error';

/**
 * Filtro que captura ÚNICAMENTE errores tipados del dominio.
 *
 * ¿Por qué no `@Catch()` (todos)? Para no romper la coexistencia con los
 * filters internos de Nest que manejan `HttpException` (y `try/catch` en
 * services legacy que lanza `NotFoundException`, `ForbiddenException`, etc.).
 *
 * Cuando TODOS los use-cases estén migrados al dominio de errores
 * tipados, este filtro podrá pasar a `@Catch()` para tener un envelope
 * uniforme. Hoy, se mantiene el scope acotado.
 */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(exception.httpStatus).json({
      error: {
        code: exception.code,
        message: exception.message,
        context: exception.context,
      },
    });
  }
}
