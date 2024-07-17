import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VacantToLanguage } from './vacant_to_language.model';

@Entity()
export class Vacant {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 60,
  })
  title: string;

  @Column({
    type: 'text',
  })
  about: string;

  @Column({
    type: 'smallint',
  })
  experience: number;

  @Column({
    type: 'varchar',
    length: 60,
  })
  language: string;

  @Column({
    type: 'date',
  })
  creation: Date;

  @Column({
    type: 'date',
  })
  modification: Date;

  @Column({
    type: 'int',
  })
  salary_offer: number;

  @OneToMany(() => VacantToLanguage, vacantToLanguage => vacantToLanguage.vacant)
  VacantToLanguage: VacantToLanguage;
}
