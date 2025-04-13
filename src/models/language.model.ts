import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ResumeLanguage } from './resume_to_language.model';
import { VacantToLanguage } from './vacant_to_language.model';

@Entity()
export class Language {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
    length: 60,
  })
  name: string;

  @OneToMany(() => ResumeLanguage, resumeToLanguage => resumeToLanguage.resume)
  resumeLanguage: Relation<ResumeLanguage>;

  @OneToMany(() => VacantToLanguage, vacantToLanguage => vacantToLanguage.vacant)
  VacantToLanguage: Relation<VacantToLanguage>;
}
