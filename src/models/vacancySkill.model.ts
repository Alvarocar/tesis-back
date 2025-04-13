import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Vacant } from './vacant.model';

@Entity({
  name: 'vacancy_skill',
})
export class VacancySkill {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 60,
  })
  name: string;

  @ManyToOne(() => Vacant, vacant => vacant.position)
  vacancy: Relation<Vacant>;
}
