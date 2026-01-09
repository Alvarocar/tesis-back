import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { Injectable } from '@nestjs/common';
import { hash, genSalt, compare } from 'bcrypt';
import { TokenDto } from './dto/token.dto';
import { SECURITY_JWT_SECRET } from '../constants/env.constant';

@Injectable()
export class SecurityService {
  async generateHash(password: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(password, salt);
  }

  async compareHash(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await compare(password, hashedPassword);
  }

  async generateToken(payload: TokenDto): Promise<string> {
    const secret = new TextEncoder().encode(SECURITY_JWT_SECRET);
    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);
  }

  async verifyToken(token: string): Promise<TokenDto & JWTPayload> {
    const secret = new TextEncoder().encode(SECURITY_JWT_SECRET);
    const { payload } = await jwtVerify<TokenDto>(token, secret);
    return payload;
  }
}
