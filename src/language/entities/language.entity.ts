import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { VacancyLanguage } from 'src/vacancy/entities/vacancyLanguage.entity';
import { ResumeLanguage } from 'src/resume/entities/resume-language.entity';

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

  @OneToMany(
    () => ResumeLanguage,
    (resumeToLanguage) => resumeToLanguage.resume,
  )
  resumeLanguage: Relation<ResumeLanguage>;

  @OneToMany(() => VacancyLanguage, (vacancyLanguage) => vacancyLanguage.vacant)
  vacancyLanguage: Relation<VacancyLanguage>[];
}
