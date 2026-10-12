import { Inject, Injectable } from '@nestjs/common';
import type { CreateApplicantDto } from 'src/auth/dto/create-applicant.dto';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import type { UpdateApplicantDto } from './dto/update-applicant.dto';
import { CreateApplicantUseCase } from './use-cases/create-applicant.use-case';
import { FindApplicantUseCase } from './use-cases/find-applicant.use-case';
import { UpdateApplicantUseCase } from './use-cases/update-applicant.use-case';
import { DeleteApplicantUseCase } from './use-cases/delete-applicant.use-case';
import {
  GeneratePasswordResetUseCase,
  type GeneratePasswordResetInput,
} from './use-cases/generate-password-reset.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import type { Applicant } from './entities/applicant.entity';
import {
  APPLICANT_REPOSITORY,
  type ApplicantRepositoryPort,
} from './repositories/applicant.repository';

/**
 * Legacy facade: mantiene compatibilidad con los consumidores actuales
 * (`AuthController`, `ApplicantController`). Internamente delega en use-cases.
 * Se conserva durante la migración de los demás features.
 */
@Injectable()
export class ApplicantService {
  constructor(
    private readonly createUc: CreateApplicantUseCase,
    private readonly findUc: FindApplicantUseCase,
    private readonly updateUc: UpdateApplicantUseCase,
    private readonly deleteUc: DeleteApplicantUseCase,
    private readonly generateResetUc: GeneratePasswordResetUseCase,
    private readonly resetUc: ResetPasswordUseCase,
    @Inject(APPLICANT_REPOSITORY)
    private readonly applicantRepo: ApplicantRepositoryPort,
  ) {}

  async create(dto: CreateApplicantDto) {
    return this.createUc.execute(dto);
  }

  async findOne(id: number) {
    return this.findUc.execute(id);
  }

  /** Lookup usado por `AuthService.signInApplicant`. */
  findByEmail(email: string): Promise<Applicant | null> {
    return this.applicantRepo.findByEmail(email);
  }

  async update(user: TokenDto, dto: UpdateApplicantDto) {
    return this.updateUc.execute(user, dto);
  }

  async deleteApplicant(id: number) {
    return this.deleteUc.execute({ id } as TokenDto);
  }

  async generatePasswordResetToken(email: string) {
    return this.generateResetUc.execute({
      email,
    } satisfies GeneratePasswordResetInput);
  }

  async resetPassword(token: string, newPassword: string) {
    return this.resetUc.execute({ token, newPassword });
  }
}
