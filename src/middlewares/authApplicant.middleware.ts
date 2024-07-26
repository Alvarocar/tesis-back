import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithApplicant } from '@interfaces/auth.interface';
import { ApplicantRepository } from '@/repositories/applicant.repository';

const authApplicantMiddleware = async (req: RequestWithApplicant, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null;

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
      const applicantId = verificationResponse.id;
      const findUser = await ApplicantRepository.findOneBy({ id: applicantId });

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, 'el usuario no existe en la base de datos'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authApplicantMiddleware;
