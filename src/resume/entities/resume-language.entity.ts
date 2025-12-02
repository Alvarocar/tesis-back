import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Language } from 'src/shared/entities/language';
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

  @ManyToOne(() => Resume, resume => resume.resumeLanguage)
  resume: Relation<Resume>;

  @ManyToOne(() => Language, language => language.resumeLanguage)
  language: Relation<Language>;
}
