import { TokenData } from '@/interfaces/auth.interface';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY, TOKEN_TYPE } from '@/config';
import { compare, hash } from 'bcrypt';
import { ESecurity } from '@/enums/security.enum';
/**
 *
 * @param user Data to be stored in the token
 * @param [options] secret key and time to expirate in hours
 * @returns new Token
 */
export function createTokenRest<Entity extends {}>(user: Entity, options: { secret?: string; timeExpire?: number } = {}): string {
  const { secret = SECRET_KEY, timeExpire = 24 } = options;
  const expiresIn: number = 3600 * timeExpire;
  return `${TOKEN_TYPE} ${sign({ ...user }, secret, { expiresIn })}`;
}

export function encrypt(value: string | Buffer) {
  return hash(value, ESecurity.SALT_NUMBER);
}

export function compareHash(value: string | Buffer, encrypted: string) {
  return compare(value, encrypted);
}
