import { NextFunction, Response } from 'express';

export function setAuthorizationMiddleware(_, res: Response, next: NextFunction) {
  console.log('MiddleWare ejecutandoce..');
  const auth = res.locals.auth;
  console.log(auth, 'Middleware');
  if (auth) res.setHeader('Authorization', auth);
  next();
}
