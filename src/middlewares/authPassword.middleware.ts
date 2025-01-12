import { ENV } from '@/constants';
import { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from 'routing-controllers';

export function authPasswordMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.headers.authorization !== ENV.AUTH_PASSWORD) {
    next(new ForbiddenError('Necesita Credenciales Validas'));
  } else {
    next();
  }
}
