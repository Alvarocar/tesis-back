import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Resume } from './resume.model';
import { Language } from './language.model';

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
