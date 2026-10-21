import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Language } from 'src/language/entities/language.entity';
import { Resume } from './resume.entity';

@Entity('resume_language')
export class ResumeLanguage {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'smallint',
    name: 'language_level',
  })
  languageLevel: number;

  @ManyToOne(() => Resume, (resume) => resume.resumeLanguage, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resume_id' })
  resume: Relation<Resume>;

  @ManyToOne(() => Language, (language) => language.resumeLanguage)
  @JoinColumn({ name: 'language_id' })
  language: Relation<Language>;
}
