import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from './language.model';
import { Vacant } from './vacant.model';

@Entity()
export class VacantToLanguage {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'smallint',
    name: 'language_level',
  })
  languageLevel: number;

  @ManyToOne(() => Vacant, vacant => vacant.VacantToLanguage)
  @JoinColumn({ name: 'vacant_id' })
  vacant: Relation<Vacant>;

  @ManyToOne(() => Language, language => language.VacantToLanguage)
  @JoinColumn({ name: 'language_id' })
  language: Relation<Language>;
}
