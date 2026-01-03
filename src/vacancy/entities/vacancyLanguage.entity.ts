import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Vacancy } from './vacancy.entity';
import { Language } from 'src/language/entities/language';

@Entity({ name: 'vacancy_language' })
export class VacancyLanguage {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'smallint',
    name: 'language_level',
  })
  languageLevel: number;

  @ManyToOne(() => Vacancy, vacant => vacant.vacancyLanguage)
  @JoinColumn({ name: 'vacant_id' })
  vacant: Relation<Vacancy>;

  @ManyToOne(() => Language, language => language.vacancyLanguage)
  @JoinColumn({ name: 'language_id' })
  language: Relation<Language>;
}
