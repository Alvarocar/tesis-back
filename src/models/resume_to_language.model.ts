import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Resume } from './resume.model';
import { Language } from './language.model';

@Entity()
export class ResumeToLanguage {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'smallint',
  })
  language_level: number;

  @ManyToOne(() => Resume, resume => resume.resumeToLanguage)
  resume: typeof Resume;

  @ManyToOne(() => Language, language => language.resumeToLanguage)
  language: typeof Language;
}
