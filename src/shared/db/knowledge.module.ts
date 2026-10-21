import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from 'src/resume/entities/resume.entity';
import { Knowledge } from 'src/shared/db/entities/knowledge.entity';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeTypeOrmRepository } from './repositories/knowledge.typeorm.repository';
import { KNOWLEDGE_REPOSITORY } from 'src/resume/repositories/sub-resource.repositories';
import { ReplaceKnowledgeForApplicantUseCase } from './use-cases/replace-knowledge.use-case';
import { ResumeModule } from 'src/resume/resume.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, Knowledge]),
    forwardRef(() => ResumeModule),
  ],
  providers: [
    {
      provide: KNOWLEDGE_REPOSITORY,
      useClass: KnowledgeTypeOrmRepository,
    },
    ReplaceKnowledgeForApplicantUseCase,
    KnowledgeService,
  ],
  exports: [KnowledgeService, KNOWLEDGE_REPOSITORY],
})
export class KnowledgeModule {}