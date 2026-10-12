import { Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import {
  DeleteResumeChainBuilder,
  type DeleteResumeContext,
} from '../chains/delete-resume.chain';

/**
 * Use-case: eliminar un resume del applicant.
 *
 * Flujo: ValidateOwnership → PerformSoftDelete.
 */
@Injectable()
export class DeleteResumeUseCase {
  constructor(
    private readonly chainBuilder: DeleteResumeChainBuilder,
    private readonly logger: StructuredLogger,
  ) {}

  async execute(id: number, user: TokenDto): Promise<void> {
    return this.logger.timed(
      'resume.delete',
      async () => {
        const ctx: DeleteResumeContext = {
          resumeId: id,
          applicantId: user.id,
        };
        await this.chainBuilder.build().handle(ctx);
      },
      { resumeId: id, applicantId: user.id },
    );
  }
}
