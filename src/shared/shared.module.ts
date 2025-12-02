import { Module, Global } from '@nestjs/common';
import { SecurityService } from './security/security.service';
import { SecurityGuard } from './security/security.guard';

@Global()
@Module({
  providers: [SecurityService, SecurityGuard],
  exports: [SecurityService, SecurityGuard]
})
export class SharedModule {}
