import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '../security.service';
import { METADATA_KEY } from '../../constants/metadata.constant';
import { UnauthorizedError } from '../../errors/domain.error';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly securityService: SecurityService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      const hasRoles = this.reflector.getAllAndOverride<boolean>(
        METADATA_KEY.ROLES,
        [context.getHandler(), context.getClass()],
      );
      if (!hasRoles) return true;
      throw new UnauthorizedError('Cabecera Authorization requerida');
    }
    try {
      const payload = await this.securityService.verifyToken(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request['user'] = payload;
    } catch {
      throw new UnauthorizedError('Token inválido o expirado');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
