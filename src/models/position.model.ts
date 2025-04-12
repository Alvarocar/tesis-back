import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Vacant } from './vacant.model';

@Entity({
  name: 'position',
})
export class Position {
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

  @OneToMany(() => Vacant, vacant => vacant.position)
  vacancies: (typeof Vacant)[];
}
