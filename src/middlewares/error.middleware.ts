import { NextFunction, Request, Response } from 'express';
import { logger } from '@utils/logger';
import { omit } from 'lodash';
import { HttpError } from 'routing-controllers';

const errorMiddleware = (error: HttpError, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.httpCode || 500;
    const message: string = error.message || 'Something went wrong';

    console.debug('MiddleWare', error);

    const responseError = { ...omit(error, ['name']), status, message };

    console.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json(responseError);
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
