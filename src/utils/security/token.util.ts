import { TokenData } from '@/interfaces/auth.interface';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY, TOKEN_TYPE } from '@/config';
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
