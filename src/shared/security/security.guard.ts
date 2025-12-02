import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { SecurityService } from './security.service';
import { METADATA_KEY } from '../constants/metadata.constant';

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor(
    private readonly securityService: SecurityService,
    private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(METADATA_KEY.IS_PUBLIC, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) return true;
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.securityService.verifyToken(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}