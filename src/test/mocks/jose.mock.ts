/**
 * Mock de la librería jose para tests
 */

export class SignJWT {
  private payload: any = {};
  private header: any = {};

  constructor(payload: any) {
    this.payload = payload;
  }

  setProtectedHeader(header: any) {
    this.header = header;
    return this;
  }

  setIssuedAt() {
    return this;
  }

  setExpirationTime(exp: string | number) {
    return this;
  }

  setSubject(sub: string) {
    this.payload.sub = sub;
    return this;
  }

  async sign(key: any): Promise<string> {
    return 'mocked-jwt-token';
  }
}

export async function jwtVerify(token: string, key: any): Promise<any> {
  return {
    payload: {
      sub: '1',
      email: 'test@example.com',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    protectedHeader: {
      alg: 'HS256',
      typ: 'JWT',
    },
  };
}

export interface JWTPayload {
  [key: string]: any;
}

export default {
  SignJWT,
  jwtVerify,
};
