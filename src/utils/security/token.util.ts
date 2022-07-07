import { TokenData } from '@/interfaces/auth.interface';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY, TOKEN_TYPE } from '@/config';
/**
 *
 * @param user Data to be stored in the token
 * @param [options] secret key and time to expirate in hours
 * @returns new Token
 */
export function createTokenRest<Entity extends {}>(user: Entity, { secret = SECRET_KEY, timeExpire = 24 }): string {
  if (timeExpire < 1) timeExpire = 1;
  const expiresIn: number = 3600 * timeExpire;
  return `${TOKEN_TYPE} ${sign({ ...user }, secret, { expiresIn })}`;
}
