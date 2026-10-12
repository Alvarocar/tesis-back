import { Inject, Injectable } from '@nestjs/common';
import { StructuredLogger } from 'src/shared/logging/structured-logger';
import { NotFoundError } from 'src/shared/errors/domain.error';
import { BaseChainHandler } from 'src/shared/chains/base-chain.handler';
import {
  RESUME_REPOSITORY,
  type ResumeRepositoryPort,
} from '../repositories/resume.repository';

export interface DeleteResumeContext {
  readonly resumeId: number;
  readonly applicantId: number;
}

@Injectable()
export class ValidateOwnershipHandler extends BaseChainHandler<DeleteResumeContext> {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
    private readonly logger: StructuredLogger,
  ) {
    super();
  }

  protected async process(ctx: DeleteResumeContext): Promise<void> {
    const owned = await this.resumeRepo.existsOwned(
      ctx.resumeId,
      ctx.applicantId,
    );
    if (!owned) {
      throw new NotFoundError('Resume', ctx.resumeId);
    }
    this.logger.debug('resume.delete.ownership', { resumeId: ctx.resumeId });
  }
}

/**
 * Handler: ejecuta el delete real.
 */
@Injectable()
export class PerformSoftDeleteHandler extends BaseChainHandler<DeleteResumeContext> {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepo: ResumeRepositoryPort,
  ) {
    super();
  }

  protected async process(ctx: DeleteResumeContext): Promise<void> {
    await this.resumeRepo.softDelete(ctx.resumeId, ctx.applicantId);
  }
}

@Injectable()
export class DeleteResumeChainBuilder {
  constructor(
    private readonly ownership: ValidateOwnershipHandler,
    private readonly perform: PerformSoftDeleteHandler,
  ) {}

  build() {
    return this.ownership.setNext(this.perform);
  }
}
