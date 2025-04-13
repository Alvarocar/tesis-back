import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
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
  })
  laguage_level: number;

  @ManyToOne(() => Vacant, vacant => vacant.VacantToLanguage)
  vacant: Relation<Vacant>;

  @ManyToOne(() => Language, language => language.VacantToLanguage)
  language: Relation<Language>;
}
