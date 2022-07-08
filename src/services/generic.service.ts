import { InternalServerException } from '@/exceptions/HttpException';
import { HttpError } from 'routing-controllers';

export class GenericService {
  protected internalError(e: unknown, message: string) {
    console.error(e);
    if (e instanceof HttpError) throw e;
    throw new InternalServerException(message);
  }
}
