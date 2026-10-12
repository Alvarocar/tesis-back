import { Injectable } from '@nestjs/common';
import type { TokenDto } from 'src/shared/security/dto/token.dto';
import type { CreateResumeDto } from './dto/create-resume.dto';
import type { UpdateResumeDto } from './dto/update-resume.dto';
import type { UpdateAboutMeDto } from './dto/update-about-me-resume.dto';
import { CreateResumeUseCase } from './use-cases/create-resume.use-case';
import { FindResumeUseCase } from './use-cases/find-resume.use-case';
import { UpdateResumeTitleUseCase } from './use-cases/update-resume-title.use-case';
import { UpdateResumeAboutMeUseCase } from './use-cases/update-about-me.use-case';
import { ListResumesUseCase } from './use-cases/list-resumes.use-case';
import { DeleteResumeUseCase } from './use-cases/delete-resume.use-case';

/**
 * Legacy facade: delega en use-cases.
 */
@Injectable()
export class ResumeService {
  constructor(
    private readonly createUc: CreateResumeUseCase,
    private readonly findUc: FindResumeUseCase,
    private readonly updateTitleUc: UpdateResumeTitleUseCase,
    private readonly updateAboutMeUc: UpdateResumeAboutMeUseCase,
    private readonly listUc: ListResumesUseCase,
    private readonly deleteUc: DeleteResumeUseCase,
  ) {}

  create(input: CreateResumeDto, user: TokenDto) {
    return this.createUc.execute(input, user);
  }

  findOne(id: number, user: TokenDto) {
    return this.findUc.execute(id, user);
  }

  updateTitle(input: UpdateResumeDto, user: TokenDto) {
    return this.updateTitleUc.execute(input, user);
  }

  updateAboutMe(input: UpdateAboutMeDto, user: TokenDto) {
    return this.updateAboutMeUc.execute(input, user);
  }

  findAll(user: TokenDto) {
    return this.listUc.execute(user);
  }

  delete(id: number, user: TokenDto) {
    return this.deleteUc.execute(id, user);
  }
}
