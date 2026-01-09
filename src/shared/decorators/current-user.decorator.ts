import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenDto } from '../security/dto/token.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as TokenDto;
  },
);
