import { ESecurity } from '@/enums/security.enum';
import { InternalServerException } from '@/exceptions/HttpException';
import { compare, hash } from 'bcrypt';
import { HttpError } from 'routing-controllers';

export class GenericService {
  protected internalError(e: unknown, message: string) {
    console.error(e);
    if (e instanceof HttpError) throw e;
    throw new InternalServerException(message);
  }

  protected encrypt(value: string | Buffer) {
    return hash(value, ESecurity.SALT_NUMBER);
  }

  protected compareHash(value: string | Buffer, encrypted: string) {
    return compare(value, encrypted);
  }
}
