import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEY } from 'src/shared/constants/metadata.constant';
import { Role } from 'src/shared/enums/role.enum';
import { TokenDto } from '../dto/token.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      METADATA_KEY.ROLES,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user?: TokenDto }>();
    const userRole = request.user?.role;
    if (!userRole) {
      return false;
    }
    return requiredRoles.includes(userRole);
  }
}
