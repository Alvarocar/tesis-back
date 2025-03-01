import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResumeToLanguage } from './resume_to_language.model';
import { VacantToLanguage } from './vacant_to_language.model';

@Entity()
export class Language {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
  })
  name: string;

  @OneToMany(() => ResumeToLanguage, resumeToLanguage => resumeToLanguage.resume)
  resumeToLanguage: typeof ResumeToLanguage;

  @OneToMany(() => VacantToLanguage, vacantToLanguage => vacantToLanguage.vacant)
  VacantToLanguage: typeof VacantToLanguage;
}
