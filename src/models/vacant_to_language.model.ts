import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  vacant: Vacant;

  @ManyToOne(() => Language, language => language.VacantToLanguage)
  language: typeof Language;
}
