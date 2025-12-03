import { Module, Global } from '@nestjs/common';
import { SecurityService } from './security/security.service';
import { TokenGuard } from './security/guards/token.guard';

@Global()
@Module({
  providers: [SecurityService, TokenGuard],
  exports: [SecurityService, TokenGuard]
})
export class SharedModule {}
